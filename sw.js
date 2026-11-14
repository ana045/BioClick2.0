const VERSION = "v1";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icono-192.png",
  "./icono-512.png"
];

// 1. Instalación: guarda todos los archivos en la caché del navegador
self.addEventListener("install", (evento) => {
    evento.waitUntil(
        caches.open(VERSION).then((cache) => {
            return cache.addAll(ARCHIVOS);
        })
    );
});

// 2. Activación: limpia las versiones viejas de la caché
self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches.keys().then((claves) => {
            return Promise.all(
                claves.map((clave) => {
                    if (clave !== VERSION) {
                        return caches.delete(clave);
                    }
                })
            );
        })
    );
});

// 3. Interceptar peticiones: responde primero con la copia guardada (estrategia caché primero)
self.addEventListener("fetch", (evento) => {
    evento.respondWith(
        caches.match(evento.request).then((respuestaEnCache) => {
            return respuestaEnCache || fetch(evento.request);
        })
    );
});
```

---

### 2. Registrar el Service Worker al final de `app.js`
Para que el navegador active este "portero" que guarda las copias, debemos registrarlo desde nuestro código principal. 

Agregá estas líneas al **final de todo** en tu archivo **`app.js`**:

```javascript
// --- REGISTRO DEL SERVICE WORKER PARA PWA ---
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
            .then(() => console.log("Service Worker registrado con éxito."))
            .catch((error) => console.log("Error al registrar el Service Worker:", error));
    });
}