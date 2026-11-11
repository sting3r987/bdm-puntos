/* Base DM Puntos: service worker mínimo (hace falta uno para que la app se pueda instalar y recibir "Compartir") */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(){});
