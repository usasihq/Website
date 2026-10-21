/**
 * IndexNow key and endpoints. The key file is served from public/<key>.txt
 * so search engines can verify submissions. Cloudflare Crawler Hints cannot
 * be toggled with the site's API token, so the site submits URLs itself.
 */
export const INDEXNOW_KEY = "a7f3c91e4b2d6805f1c8e0a4d6b9372c";
export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_HOST = "unitedstatesofamericasuperintelligence.com";
export const INDEXNOW_MAX_URLS = 10_000;
export const INDEXNOW_LAST_PATH = "data/jobs/indexnow-last.json";
