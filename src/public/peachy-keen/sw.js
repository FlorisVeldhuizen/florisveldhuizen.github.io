// Bump on a release that has to drop everything the browser is holding; hashed asset names cover the rest.
const CACHE = "peachy-keen-v1";

const SHELL = [
  "/peachy-keen/",
  "/peachy-keen/manifest.webmanifest",
  "/peachy-keen/icon-192.png",
  "/peachy-keen/icon-512.png",
  "/peachy-keen/favicon-32.png",
];

const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE).map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const keep = (res) => res.ok || res.type === "opaque";

async function freshFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return (
      (await cache.match(request)) ||
      (await cache.match("/peachy-keen/")) ||
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (keep(res)) cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const local = url.origin === self.location.origin;
  if (!local && !FONT_HOSTS.includes(url.hostname)) return;
  // The page names the hashed bundle, so a stale cached page would pin an old build.
  if (request.mode === "navigate") e.respondWith(freshFirst(request));
  else e.respondWith(cacheFirst(request));
});
