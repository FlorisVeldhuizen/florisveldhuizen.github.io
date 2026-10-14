// Installed copies of the game still check this file; it clears their cache and sends them to the new home.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((tabs) =>
        tabs.forEach((tab) => tab.navigate("https://jigglepeach.com")),
      ),
  );
});
