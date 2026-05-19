const CACHE_NAME = 'qui-mange-quoi-v1'
const urlsToCache = [
  '/',
  '/auth',
  '/profil',
  '/logo-icon.png',
  '/logo.png',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response
      return fetch(event.request)
    })
  )
})