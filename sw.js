/* ==========================================================================
   Offlinebetrieb. Die gebündelte index.html enthält Stylesheet, Programm und Fragen.
   Sie wird bei der Installation abgelegt und
   danach zuerst aus dem Zwischenspeicher bedient. Beim Wechsel der Version
   unten den Namen erhöhen, dann wird der alte Bestand verworfen.
   Alle Pfade sind relativ, damit die Anwendung auch in einem Unterordner
   (GitHub Pages) läuft.
   ========================================================================== */

const BESTAND = "seerecht-v1";

const DATEIEN = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
];

self.addEventListener("install", (ereignis) => {
  ereignis.waitUntil(
    caches
      .open(BESTAND)
      .then((bestand) => bestand.addAll(DATEIEN))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (ereignis) => {
  ereignis.waitUntil(
    caches
      .keys()
      .then((namen) =>
        Promise.all(namen.filter((n) => n !== BESTAND).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (ereignis) => {
  const anfrage = ereignis.request;
  if (anfrage.method !== "GET") return;
  if (new URL(anfrage.url).origin !== self.location.origin) return;

  ereignis.respondWith(
    caches.match(anfrage).then((gefunden) => {
      if (gefunden) return gefunden;
      return fetch(anfrage)
        .then((antwort) => {
          if (antwort && antwort.ok && antwort.type === "basic") {
            const kopie = antwort.clone();
            caches.open(BESTAND).then((bestand) => bestand.put(anfrage, kopie));
          }
          return antwort;
        })
        .catch(() => {
          // Bei einer Seitennavigation ohne Netz die Startseite ausliefern.
          if (anfrage.mode === "navigate") return caches.match("index.html");
          return Response.error();
        });
    })
  );
});
