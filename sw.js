// Install
self.addEventListener('install', (e) => {

    e.waitUntil(
        caches.open(cacheName)
        .then(cache => {
            console.log('Caching Files');
            
            cache.addAll(cacheAssets);
        })
        .then( () => self.skipWaiting())
    );

});

// Activate and remove old caches
self.addEventListener('activate', (e) => {

    e.waitUntil(
        caches.keys()
        .then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== cacheName) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            )
        })
    );

});

//Call Fetch
self.addEventListener('fetch', (e) => {
    console.log('Service Worker: Fetching');
    e.respondWith(
        fetch(e.request)
        .catch( () => {
            caches.match(e.request)
        })
        
        )
    
})


//Cache pages
const cacheName = 'v1';

const cacheAssets = [
    '/index.html',
    '/style.css',
    '/app.js',
    '/back.png'
];