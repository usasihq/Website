/**
 * Browser-only USASI jobs explorer. Loads usasihq/usasi-ai-jobs and filters
 * client-side so a free static Hugging Face Space can host it.
 */

export const DATASET = "usasihq/usasi-ai-jobs";
export const SITE = "https://unitedstatesofamericasuperintelligence.com";
export const PAGE_SIZE = 20;

export const CSV_URLS = [
  `https://huggingface.co/datasets/${DATASET}/raw/main/jobs.csv`,
  `https://huggingface.co/datasets/${DATASET}/resolve/main/jobs.csv`,
];

export const US_STATES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

/** Unambiguous city phrases employers write without a state code. Matches hf-space/app.py. */
export const CITY_HINTS = [
  ["san francisco", "CA"], ["sf office", "CA"], ["south san francisco", "CA"],
  ["san jose", "CA"], ["palo alto", "CA"], ["mountain view", "CA"], ["menlo park", "CA"],
  ["redwood city", "CA"], ["sunnyvale", "CA"], ["cupertino", "CA"], ["oakland", "CA"],
  ["berkeley", "CA"], ["los angeles", "CA"], ["san diego", "CA"], ["irvine", "CA"],
  ["seattle", "WA"], ["bellevue", "WA"], ["redmond", "WA"], ["kirkland", "WA"],
  ["new york city", "NY"], ["new york", "NY"], ["nyc", "NY"], ["brooklyn", "NY"],
  ["boston", "MA"], ["chicago", "IL"], ["austin", "TX"], ["dallas", "TX"], ["houston", "TX"],
  ["atlanta", "GA"], ["denver", "CO"], ["boulder", "CO"], ["miami", "FL"],
  ["pittsburgh", "PA"], ["philadelphia", "PA"], ["nashville", "TN"],
  ["salt lake city", "UT"], ["raleigh", "NC"], ["minneapolis", "MN"],
  ["ann arbor", "MI"], ["detroit", "MI"], ["baltimore", "MD"], ["phoenix", "AZ"],
];

const STATE_CODE_RE = Object.fromEntries(
  Object.keys(US_STATES).map((code) => [code, new RegExp(`\\b${code}\\b`)]),
);

/** 32-bit FNV-1a as 7 base-36 characters — same as lib/jobs/job-url.ts. */
export function shortCode(id) {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(7, "0").slice(-7);
}

export function titleSlug(title) {
  const s = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const cut = s.length > 70 ? s.slice(0, 71).replace(/-[^-]*$/, "") : s;
  return cut.replace(/-+$/, "") || "job";
}

export function usasiPage(row) {
  const page = String(row.page || "").trim();
  if (page.startsWith("https://")) return page;
  const slug = String(row.employer_slug || "").trim();
  const jobId = String(row.id || "");
  const title = String(row.title || "job");
  return `${SITE}/jobs/at/${slug}/${titleSlug(title)}-${shortCode(jobId)}/`;
}

export function statesInText(text) {
  if (!text) return new Set();
  const found = new Set();
  const lower = text.toLowerCase();
  for (const [code, name] of Object.entries(US_STATES)) {
    if (STATE_CODE_RE[code].test(text) || lower.includes(name.toLowerCase())) found.add(code);
  }
  for (const [hint, code] of CITY_HINTS) {
    if (lower.includes(hint)) found.add(code);
  }
  return found;
}

export function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell !== "")) rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const obj = {};
    for (let idx = 0; idx < headers.length; idx++) obj[headers[idx]] = cells[idx] ?? "";
    return obj;
  });
}

function cell(value) {
  if (value == null) return "";
  return String(value).trim();
}

function toNumber(value) {
  const text = cell(value);
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

export function isRemote(row) {
  if (cell(row.workplace).toLowerCase() === "remote") return true;
  const value = row.remote;
  if (value === true) return true;
  if (typeof value === "string" && ["true", "1", "yes"].includes(value.trim().toLowerCase())) return true;
  return false;
}

export function formatPay(row) {
  const currency = cell(row.salary_currency) || "USD";
  const period = cell(row.salary_period);
  const lo = toNumber(row.salary_min);
  const hi = toNumber(row.salary_max);
  if (lo == null && hi == null) return "";
  const symbol = currency === "USD" ? "$" : `${currency} `;
  const money = (n) => (n >= 100 ? `${symbol}${Math.round(n).toLocaleString("en-US")}` : `${symbol}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  const text = lo != null && hi != null && lo !== hi ? `${money(lo)}–${money(hi)}` : money(lo ?? hi);
  return period ? `${text} / ${period}` : text;
}

export function postedLabel(value) {
  const text = cell(value);
  return text ? text.slice(0, 10) : "";
}

export function hydrateJob(raw) {
  const locations = cell(raw.locations);
  const lo = toNumber(raw.salary_min);
  const hi = toNumber(raw.salary_max);
  const posted = cell(raw.posted_at);
  const postedMs = posted ? Date.parse(posted) : NaN;
  return {
    ...raw,
    title: cell(raw.title),
    employer: cell(raw.employer),
    employer_slug: cell(raw.employer_slug),
    locations,
    workplace: cell(raw.workplace),
    employment_type: cell(raw.employment_type),
    official_url: cell(raw.official_url),
    last_seen: cell(raw.last_seen),
    searchBlob: `${cell(raw.title)} ${cell(raw.employer)} ${locations} ${cell(raw.employer_slug)}`.toLowerCase(),
    locationBlob: locations.toLowerCase(),
    states: statesInText(locations),
    remote: isRemote(raw),
    hasPay: lo != null || hi != null,
    payLabel: formatPay(raw),
    postedLabel: postedLabel(posted),
    postedMs: Number.isFinite(postedMs) ? postedMs : 0,
    href: usasiPage(raw),
  };
}

export function filterJobs(jobs, query) {
  const keyword = (query.keyword || "").trim().toLowerCase();
  const company = query.company || "";
  const state = query.state || "";
  const location = (query.location || "").trim().toLowerCase();
  const workplace = query.workplace || "";
  const employment = query.employment || "";
  const remoteOnly = Boolean(query.remoteOnly);
  const hasPay = Boolean(query.hasPay);
  const out = [];
  for (const job of jobs) {
    if (keyword && !job.searchBlob.includes(keyword)) continue;
    if (company && job.employer !== company) continue;
    if (location && !job.locationBlob.includes(location)) continue;
    if (state && !job.states.has(state)) continue;
    if (workplace && job.workplace !== workplace) continue;
    if (remoteOnly && !job.remote) continue;
    if (employment && job.employment_type !== employment) continue;
    if (hasPay && !job.hasPay) continue;
    out.push(job);
  }
  return out;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

export function renderCards(pageRows) {
  if (!pageRows.length) {
    return '<p class="usasi-empty">No listings match those filters. Try a broader keyword or clear a filter.</p>';
  }
  const cards = pageRows.map((row) => {
    const page = escapeAttr(row.href);
    const title = escapeHtml(row.title || "Untitled listing");
    const employer = escapeHtml(row.employer);
    const locations = escapeHtml(row.locations || "Location not stated");
    const workplace = escapeHtml(row.workplace || "unknown");
    const employment = escapeHtml(row.employment_type);
    const official = escapeAttr(row.official_url);
    const pay = escapeHtml(row.payLabel);
    const posted = escapeHtml(row.postedLabel);
    const badges = [];
    if (workplace && workplace !== "unknown") badges.push(`<span class="usasi-badge">${workplace}</span>`);
    if (employment && employment !== "unknown") badges.push(`<span class="usasi-badge">${employment}</span>`);
    if (row.remote) badges.push('<span class="usasi-badge usasi-badge-remote">remote</span>');
    const meta = [employer, locations];
    if (posted) meta.push(`Posted ${posted}`);
    const officialLink = row.official_url
      ? ` · <a href="${official}" target="_blank" rel="noopener noreferrer">Employer posting</a>`
      : "";
    return `<article class="usasi-card">
  <a class="usasi-title" href="${page}" target="_blank" rel="noopener noreferrer">${title}</a>
  <p class="usasi-meta">${meta.join(" · ")}</p>
  <p class="usasi-badges">${badges.join("")}${pay ? `<span class="usasi-pay">${pay}</span>` : ""}</p>
  <p class="usasi-links"><a href="${page}" target="_blank" rel="noopener noreferrer">USASI listing</a>${officialLink}</p>
</article>`;
  });
  return `<div class="usasi-list">${cards.join("")}</div>`;
}

async function loadCsvText() {
  let lastError = null;
  for (const url of CSV_URLS) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) {
        lastError = new Error(`${url} → ${res.status}`);
        continue;
      }
      return await res.text();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error(`Could not load ${DATASET}`);
}

function fillSelect(el, values, { anyLabel = "Any" } = {}) {
  el.replaceChildren();
  const any = document.createElement("option");
  any.value = "";
  any.textContent = anyLabel;
  el.append(any);
  for (const value of values) {
    const opt = document.createElement("option");
    if (typeof value === "string") {
      opt.value = value;
      opt.textContent = value;
    } else {
      opt.value = value.value;
      opt.textContent = value.label;
    }
    el.append(opt);
  }
}

function snapshotLine(jobs) {
  let latest = "";
  for (const job of jobs) {
    const day = postedLabel(job.last_seen);
    if (day && day > latest) latest = day;
  }
  const count = jobs.length.toLocaleString("en-US");
  return latest
    ? `${count} open postings in this snapshot (listings last seen ${latest}).`
    : `${count} open postings in this snapshot.`;
}

export async function boot(root = document) {
  const snapshot = root.getElementById("snapshot");
  const status = root.getElementById("status");
  const results = root.getElementById("results");
  const form = root.getElementById("filters");
  const keywordEl = root.getElementById("keyword");
  const companyEl = root.getElementById("company");
  const stateEl = root.getElementById("state");
  const locationEl = root.getElementById("location");
  const workplaceEl = root.getElementById("workplace");
  const employmentEl = root.getElementById("employment");
  const remoteEl = root.getElementById("remote");
  const hasPayEl = root.getElementById("hasPay");
  const prevEl = root.getElementById("prev");
  const nextEl = root.getElementById("next");

  fillSelect(
    stateEl,
    Object.entries(US_STATES).map(([code, name]) => ({ value: code, label: `${code} — ${name}` })),
  );
  fillSelect(companyEl, []);
  fillSelect(employmentEl, []);

  let jobs = [];
  let filtered = [];
  let page = 1;

  const readQuery = () => ({
    keyword: keywordEl.value,
    company: companyEl.value,
    state: stateEl.value,
    location: locationEl.value,
    workplace: workplaceEl.value,
    employment: employmentEl.value,
    remoteOnly: remoteEl.checked,
    hasPay: hasPayEl.checked,
  });

  const renderPage = () => {
    const total = filtered.length;
    const pages = Math.max(1, total ? Math.ceil(total / PAGE_SIZE) : 1);
    page = Math.min(Math.max(page, 1), pages);
    const start = (page - 1) * PAGE_SIZE;
    const chunk = filtered.slice(start, start + PAGE_SIZE);
    if (total === 0) {
      status.textContent = "No matching listings.";
    } else {
      const end = Math.min(start + PAGE_SIZE, total);
      status.innerHTML = `Showing <strong>${(start + 1).toLocaleString("en-US")}–${end.toLocaleString("en-US")}</strong> of <strong>${total.toLocaleString("en-US")}</strong> listings · page ${page} of ${pages}`;
    }
    results.innerHTML = renderCards(chunk);
    prevEl.disabled = page <= 1;
    nextEl.disabled = page >= pages || total === 0;
  };

  const runSearch = (resetPage) => {
    if (resetPage) page = 1;
    filtered = filterJobs(jobs, readQuery());
    renderPage();
  };

  try {
    const text = await loadCsvText();
    jobs = parseCsv(text).map(hydrateJob);
    jobs.sort((a, b) => b.postedMs - a.postedMs);
    const companies = [...new Set(jobs.map((j) => j.employer).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const employments = [...new Set(jobs.map((j) => j.employment_type).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    fillSelect(companyEl, companies);
    fillSelect(employmentEl, employments);
    snapshot.textContent = snapshotLine(jobs);
    runSearch(true);
  } catch (err) {
    snapshot.classList.add("error");
    snapshot.textContent = `Could not load ${DATASET}: ${err instanceof Error ? err.message : err}`;
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runSearch(true);
  });
  for (const el of [companyEl, stateEl, workplaceEl, employmentEl, remoteEl, hasPayEl]) {
    el.addEventListener("change", () => runSearch(true));
  }
  let debounce = 0;
  const onType = () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => runSearch(true), 150);
  };
  keywordEl.addEventListener("input", onType);
  locationEl.addEventListener("input", onType);
  prevEl.addEventListener("click", () => {
    page -= 1;
    renderPage();
  });
  nextEl.addEventListener("click", () => {
    page += 1;
    renderPage();
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => boot());
  else boot();
}
