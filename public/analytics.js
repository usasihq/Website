/**
 * Cookie-free PostHog for USASI.
 *
 * Public project token from the owner's shared PostHog US-cloud project
 * (same key published at shadowfetchstudio.com/analytics.js). Persistence is
 * "memory" so identifiers live only in page RAM: no cookies, localStorage, or
 * sessionStorage. Session replay masking is also set on the project.
 */
!function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init("phc_wCuwK2QFPvyvhH6SQMVe7xLgYC5xFtz9axEAUbXCqkgc", {
  api_host: "https://e.unitedstatesofamericasuperintelligence.com",
  ui_host: "https://us.posthog.com",
  defaults: "2026-08-30",
  person_profiles: "identified_only",
  persistence: "memory",
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
  session_recording: { maskAllInputs: true },
});

/**
 * Named click events. Capture-phase only: never preventDefault, never delay
 * navigation, never throw. app_store_click and download_click take precedence
 * over outbound_click. This site has no consent gate; PostHog is always on.
 */
(function () {
  var DOWNLOAD_EXT = /\.(dmg|exe|msi|pkg|zip|deb|rpm|AppImage|iso|tar\.gz|flatpakref)$/i;

  function allowed() {
    return typeof posthog !== "undefined" && typeof posthog.capture === "function";
  }

  function capture(name, props) {
    if (!allowed()) return;
    posthog.capture(name, props, { transport: "sendBeacon" });
  }

  function trimText(value) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > 80 ? text.slice(0, 80) : text;
  }

  function placementOf(el) {
    var zone = el.closest("[data-placement], [data-cta-zone]");
    if (!zone) return null;
    return zone.getAttribute("data-placement") || zone.getAttribute("data-cta-zone") || null;
  }

  function commonProps(el) {
    return {
      page: location.pathname,
      placement: placementOf(el),
      link_text: trimText(el.textContent),
    };
  }

  function hostBare(host) {
    return String(host || "").replace(/^www\./i, "").toLowerCase();
  }

  function isSameSite(url) {
    return hostBare(url.host) === hostBare(location.host);
  }

  function fileType(pathname) {
    var match = String(pathname || "").match(DOWNLOAD_EXT);
    return match ? match[1].toLowerCase() : null;
  }

  function isDownloadUrl(url) {
    if (/\/downloads?\//i.test(url.pathname)) return true;
    if (hostBare(url.hostname) === "github.com" && /\/releases\/download\//i.test(url.pathname)) return true;
    return Boolean(fileType(url.pathname));
  }

  function isAppStoreUrl(url) {
    var host = hostBare(url.hostname);
    return host === "apps.apple.com" || host === "itunes.apple.com" || host === "play.google.com";
  }

  function appStoreKind(url) {
    if (hostBare(url.hostname) === "play.google.com") return "google_play";
    if (url.searchParams.get("mt") === "12" || /\/mac\//i.test(url.pathname)) return "mac_app_store";
    return "app_store";
  }

  function appSlug(url, el) {
    var fromData = el.getAttribute("data-app");
    if (fromData) return fromData;
    var apps = url.pathname.match(/\/apps\/([^/]+)/i);
    if (apps) return decodeURIComponent(apps[1]);
    var parts = url.pathname.replace(/\/+$/, "").split("/");
    return parts[parts.length - 1] || null;
  }

  function appId(url) {
    var match = (url.pathname + url.search).match(/id\d+/i);
    return match ? match[0] : null;
  }

  function platformOf(url, el) {
    var fromData = el.getAttribute("data-platform");
    if (fromData) return fromData;
    var path = url.pathname.toLowerCase();
    if (/\.(dmg|pkg)$/.test(path) || /mac|darwin|osx/.test(path)) return "macos";
    if (/\.(exe|msi)$/.test(path) || /windows|win64|win32/.test(path)) return "windows";
    if (/\.(deb|rpm|appimage|flatpakref|iso)$/.test(path) || /linux/.test(path)) return "linux";
    if (/ios/.test(path)) return "ios";
    if (/android/.test(path)) return "android";
    if (/\.(tar\.gz|zip)$/.test(path) || /source/.test(path)) return "source";
    return "unknown";
  }

  function versionOf(url, el) {
    var fromData = el.getAttribute("data-version");
    if (fromData) return fromData;
    var match = url.href.match(/\/v?(\d+\.\d+(?:\.\d+)?)/);
    return match ? match[1] : null;
  }

  function handler(event) {
    try {
      var target = event.target;
      if (!target || typeof target.closest !== "function") {
        target = target && target.parentElement;
      }
      if (!target || typeof target.closest !== "function") return;
      var link = target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href");
      if (!href) return;
      var url;
      try {
        url = new URL(link.href, location.href);
      } catch (err) {
        return;
      }
      if (url.protocol === "mailto:" || url.protocol === "tel:") return;

      var props = commonProps(link);
      if (isAppStoreUrl(url)) {
        capture("app_store_click", Object.assign(props, {
          app: appSlug(url, link),
          store: appStoreKind(url),
          app_id: appId(url),
        }));
        return;
      }
      if (isDownloadUrl(url)) {
        capture("download_click", Object.assign(props, {
          product: link.getAttribute("data-product") || null,
          platform: platformOf(url, link),
          version: versionOf(url, link),
          file_type: fileType(url.pathname),
        }));
        return;
      }
      if (!isSameSite(url)) {
        capture("outbound_click", Object.assign(props, {
          domain: hostBare(url.hostname),
          url: url.origin + url.pathname,
        }));
      }
    } catch (err) {}
  }

  document.addEventListener("click", handler, true);
  document.addEventListener("auxclick", handler, true);
})();
