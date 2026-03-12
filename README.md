# 🚀 دليل تشغيل نظام أمواج للتوصيل

## الملفات في المجلد
```
amwaj-delivery/
├── config.js      ← ✏️ الملف الوحيد اللي تعدّله
├── sw.js          ← Service Worker (إشعارات الخلفية)
├── manifest.json  ← PWA settings
├── admin.html     ← صفحة أبو المحل
├── driver.html    ← صفحة المندوب
└── super.html     ← صفحة المراقبة (أنت)
```

---

## الخطوة 1 — إنشاء مشروع Firebase

1. افتح: https://console.firebase.google.com
2. اضغط **Add project**
3. الاسم: `amwaj-delivery` ← Continue
4. Google Analytics: **اتركه off** ← Create project

---

## الخطوة 2 — تفعيل Realtime Database

1. من القائمة الجانبية: **Build → Realtime Database**
2. اضغط **Create Database**
3. اختر أي منطقة (Singapore قريبة)
4. اختر **Start in test mode** ← Enable

---

## الخطوة 3 — إعدادات الويب (Web Config)

1. من الأعلى: أيقونة الترس ← **Project Settings**
2. Scroll تحت ← **Your apps** ← أيقونة `</>`
3. App nickname: `amwaj-web` ← **Register app**
4. **انسخ** كل الـ `firebaseConfig` (apiKey, authDomain, etc.)

---

## الخطوة 4 — VAPID Key للإشعارات

1. Project Settings ← **Cloud Messaging**
2. Scroll تحت ← **Web push certificates**
3. اضغط **Generate key pair**
4. **انسخ** الـ Key الطويل

---

## الخطوة 5 — تعديل config.js

افتح ملف `config.js` وضع بياناتك:

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "AIza...",        // من الخطوة 3
  authDomain:        "amwaj-delivery.firebaseapp.com",
  databaseURL:       "https://amwaj-delivery-default-rtdb.firebaseio.com",
  projectId:         "amwaj-delivery",
  storageBucket:     "amwaj-delivery.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc..."
};

const VAPID_KEY = "BK...";            // من الخطوة 4
const SUPER_PASS = "اختر كلمة مرورك السرية";
```

**افتح sw.js وضع نفس بيانات firebaseConfig فيه أيضاً.**

---

## الخطوة 6 — رفع الملفات على موقعك

### إذا عندك amwajmob.com:
ارفع كل الملفات في المجلد الرئيسي للموقع.

### إذا تريد Netlify (مجاني):
1. افتح: https://netlify.com ← Sign up
2. اضغط **Add new site → Deploy manually**
3. اسحب مجلد `amwaj-delivery` كله

---

## الخطوة 7 — Firestore Rules (اختياري للأمان)

في Realtime Database ← Rules:
```json
{
  "rules": {
    "orders":  { ".read": true, ".write": true },
    "shops":   { ".read": true, ".write": true },
    "drivers": { ".read": true, ".write": true },
    "fcm_tokens": { ".read": false, ".write": true }
  }
}
```

---

## النتيجة

| الصفحة | الرابط |
|--------|--------|
| أبو المحل | yourdomain.com/admin.html |
| المندوب | yourdomain.com/driver.html |
| المراقبة (أنت) | yourdomain.com/super.html |

---

## كيف يثبّت المندوب التطبيق؟

1. يفتح `driver.html` على Chrome موبايل
2. يضغط **"📲 تثبيت"** اللي يظهر في الأعلى
3. أو: القائمة ← **Add to Home Screen**
4. بعدها يظهر على الهوم سكرين مثل تطبيق حقيقي ✅

---

## الإشعارات

✅ الصفحة مفتوحة → صوت + toast داخل الصفحة  
✅ الصفحة مغلقة (التطبيق مثبّت) → إشعار حقيقي على الشاشة  
✅ الجهاز مقفل → إشعار على شاشة القفل مع صوت  
