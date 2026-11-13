const CACHE_NAME = 'tungprawaja-v1';
const ASSETS_TO_CACHE = [
  '/tungprawaja/',
  '/tungprawaja/index.html',
  '/tungprawaja/manifest.json',
  '/tungprawaja/icon-192.png',
  '/tungprawaja/icon-512.png'
];

// ติดตั้ง Service Worker และเก็บไฟล์ลงแคช
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ล้างแคชเก่าเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ดึงข้อมูลจากแคชมาแสดงก่อน (ช่วยให้เปิดไวและใช้ออฟไลน์ได้)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
