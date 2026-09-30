#!/usr/bin/env node
/**
 * npm run preview:static [-- --port 4321 --base /repo-name --dir out]
 *
 * A dependency-free static file server for the exported site, behaving like an
 * ordinary static host (and like GitHub Pages / Cloudflare for the parts that
 * matter here):
 *  - /path/ serves /path/index.html; /path (a directory) redirects to /path/
 *  - unknown paths serve 404.html with status 404
 *  - optional base path, to test GitHub Pages project sites
 *  - applies the rules in out/_headers (security headers, CSP, caching), so
 *    local tests exercise the same headers Cloudflare sends
 *  - compresses text responses (brotli or gzip), as Cloudflare does, so local
 *    performance measurements are realistic (--no-compress to disable)
 * No Next.js server is involved.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import zlib from "node:zlib";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const port = Number(opt("port", process.env.PORT ?? 4321));
const base = (opt("base", process.env.NEXT_PUBLIC_BASE_PATH ?? "") || "").replace(/\/+$/, "");
const dir = path.resolve(opt("dir", "out"));
const applyHeaders = !args.includes("--no-headers");
const compress = !args.includes("--no-compress");
const COMPRESSIBLE = /^(text\/|application\/(json|javascript|xml|manifest\+json)|image\/svg\+xml)/;

if (!fs.existsSync(dir)) {
  console.error(`No export at ${dir}. Run npm run build first.`);
  process.exit(1);
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

/** Minimal parser for the Cloudflare/Netlify `_headers` format. */
function loadHeaderRules() {
  const file = path.join(dir, "_headers");
  if (!applyHeaders || !fs.existsSync(file)) return [];
  const rules = [];
  let current = null;
  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    if (!/^\s/.test(raw)) {
      current = { pattern: raw.trim(), set: [], remove: [] };
      rules.push(current);
    } else if (current) {
      const line = raw.trim();
      if (line.startsWith("! ")) current.remove.push(line.slice(2).trim().toLowerCase());
      else {
        const idx = line.indexOf(":");
        current.set.push([line.slice(0, idx).trim(), line.slice(idx + 1).trim()]);
      }
    }
  }
  return rules.map((r) => ({
    ...r,
    regex: new RegExp(`^${r.pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`),
  }));
}
const headerRules = loadHeaderRules();

function headersFor(urlPath) {
  const out = {};
  for (const rule of headerRules) {
    if (!rule.regex.test(urlPath)) continue;
    for (const name of rule.remove) delete out[name];
    for (const [name, value] of rule.set) out[name.toLowerCase()] = value;
  }
  return out;
}

function send(res, status, file, urlPath, extra = {}, acceptEncoding = "") {
  const type = TYPES[path.extname(file)] ?? "application/octet-stream";
  const headers = { "content-type": type, vary: "accept-encoding", ...headersFor(urlPath), ...extra };
  if (compress && COMPRESSIBLE.test(type)) {
    if (/\bbr\b/.test(acceptEncoding)) {
      res.writeHead(status, { ...headers, "content-encoding": "br" });
      return fs.createReadStream(file).pipe(zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })).pipe(res);
    }
    if (/\bgzip\b/.test(acceptEncoding)) {
      res.writeHead(status, { ...headers, "content-encoding": "gzip" });
      return fs.createReadStream(file).pipe(zlib.createGzip({ level: 6 })).pipe(res);
    }
  }
  res.writeHead(status, headers);
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  const ae = String(req.headers["accept-encoding"] ?? "");
  const url = new URL(req.url ?? "/", "http://localhost");
  let pathname = decodeURIComponent(url.pathname);

  if (base) {
    if (pathname === base) {
      res.writeHead(301, { location: `${base}/${url.search}` });
      return res.end();
    }
    if (!pathname.startsWith(`${base}/`)) {
      const notFound = path.join(dir, "404.html");
      return send(res, 404, notFound, pathname, {}, ae);
    }
    pathname = pathname.slice(base.length);
  }

  const safe = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  let file = path.join(dir, safe);
  if (!file.startsWith(dir)) {
    res.writeHead(403);
    return res.end();
  }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!pathname.endsWith("/")) {
      res.writeHead(308, { location: `${base}${pathname}/${url.search}` });
      return res.end();
    }
    file = path.join(file, "index.html");
  }
  if (path.basename(file) === "_headers") {
    return send(res, 404, path.join(dir, "404.html"), pathname, {}, ae);
  }
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return send(res, 200, file, pathname, {}, ae);
  const html = `${file}.html`;
  if (fs.existsSync(html)) return send(res, 200, html, pathname, {}, ae);
  return send(res, 404, path.join(dir, "404.html"), pathname, {}, ae);
});

server.listen(port, () => {
  console.log(`Serving ${path.relative(process.cwd(), dir) || "."} at http://localhost:${port}${base || ""}/  (headers: ${applyHeaders ? "_headers applied" : "off"})`);
});
