const CACHE = 'sanounoo-v1';
const ASSETS = [
  '/admin.html',
  '/driver.html',
  '/super.html',
  '/manifest.json'
];

// تثبيت — كاش الملفات الأساسية
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// تفعيل — حذف الكاش القديم
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// الطلبات — الشبكة أولاً، الكاش كاحتياط
self.addEventListener('fetch', e => {
  // طلبات GAS تروح للشبكة دايماً
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // حدّث الكاش بالنسخة الجديدة
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
