// ════════════════════════════════════════════════
//  firebase-utils.js — مشترك بين كل الصفحات
// ════════════════════════════════════════════════

// ── تهيئة Firebase ──
const _app = firebase.initializeApp(FIREBASE_CONFIG);
const db   = firebase.database();

// ── مرجع البيانات ──
const REF = {
  orders:  () => db.ref('orders'),
  order:   id => db.ref(`orders/${id}`),
  shops:   () => db.ref('shops'),
  shop:    id => db.ref(`shops/${id}`),
  drivers: () => db.ref('drivers'),
  driver:  id => db.ref(`drivers/${id}`),
  tokens:  () => db.ref('fcm_tokens'),  // FCM tokens للإشعارات
};

// ── ID عشوائي ──
function makeId(){
  return '#'+Math.random().toString(36).substr(2,6).toUpperCase();
}

// ── timestamp ──
function now(){ return new Date().toISOString(); }

// ── تنسيق مبلغ ──
function fmt(n){ return Number(n).toLocaleString('ar-IQ'); }

// ── وقت مضى ──
function ago(ts){
  const m=Math.floor((Date.now()-new Date(ts))/60000);
  return m<1?'الآن':m<60?`${m} دق`:m<1440?`${Math.floor(m/60)} س`:`${Math.floor(m/1440)} يوم`;
}

// ════════════════════════════════════════════════
//  PWA — تسجيل Service Worker
// ════════════════════════════════════════════════
async function registerSW(){
  if(!('serviceWorker' in navigator)) return null;
  try{
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('SW registered');
    return reg;
  }catch(e){ console.warn('SW failed',e); return null; }
}

// ════════════════════════════════════════════════
//  FCM — طلب إذن وحفظ Token
// ════════════════════════════════════════════════
async function initPushNotifications(userId, role){
  try{
    const messaging = firebase.messaging();
    const permission = await Notification.requestPermission();
    if(permission !== 'granted'){ console.log('Notif denied'); return; }

    const token = await messaging.getToken({ vapidKey: VAPID_KEY });
    if(!token) return;

    // احفظ التوكن مع معلومات المستخدم
    await REF.tokens().child(userId).set({
      token, role,
      userId,
      updatedAt: now()
    });

    console.log('FCM token saved:', token.substr(0,20)+'...');

    // إشعار في المقدمة (الصفحة مفتوحة)
    messaging.onMessage(payload => {
      const { title, body } = payload.notification || {};
      showToastGlobal(title+' — '+body, '#FF9800', '#000');
      playBeep('new');

      // إشعار مرئي حتى لو الصفحة مفتوحة
      if(Notification.permission==='granted'){
        new Notification(title||'أمواج', {
          body: body||'',
          icon: '/icon-192.png',
          vibrate:[200,100,200]
        });
      }
    });
  }catch(e){ console.warn('FCM init failed',e); }
}

// ════════════════════════════════════════════════
//  إرسال إشعار Push عبر Firebase Cloud Messaging
//  (يُستدعى من لوحة المحل عند إرسال طلب)
//  ملاحظة: الإرسال الحقيقي يتم من server-side
//  هنا نكتب في Firebase وCloud Function ترسل
// ════════════════════════════════════════════════
async function triggerNotification(type, data){
  // نكتب حدث في Firebase — Cloud Function تلتقطه وترسل الـ push
  await db.ref('notifications_queue').push({
    type,     // 'new_order' | 'driver_accepted' | 'order_confirmed'
    data,
    ts: now()
  });
}

// ════════════════════════════════════════════════
//  صوت
// ════════════════════════════════════════════════
let _aCtx = null;
function playBeep(type){
  try{
    if(!_aCtx) _aCtx=new(window.AudioContext||window.webkitAudioContext)();
    const seqs={new:[520,660,800],alert:[900,700,1000]};
    (seqs[type]||seqs.new).forEach((f,i)=>{
      const o=_aCtx.createOscillator(),g=_aCtx.createGain();
      o.connect(g);g.connect(_aCtx.destination);
      o.frequency.value=f;o.type='sine';
      const t=_aCtx.currentTime+i*.14;
      g.gain.setValueAtTime(.22,t);
      g.gain.exponentialRampToValueAtTime(.001,t+.25);
      o.start(t);o.stop(t+.25);
    });
  }catch(e){}
}

// ════════════════════════════════════════════════
//  Toast مشترك
// ════════════════════════════════════════════════
let _tt=null;
function showToastGlobal(msg,bg,color){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg; t.style.background=bg||'#00E676'; t.style.color=color||'#000';
  t.classList.add('on');
  if(_tt)clearTimeout(_tt);
  _tt=setTimeout(()=>t.classList.remove('on'),3500);
}

// ════════════════════════════════════════════════
//  PWA Install Prompt
// ════════════════════════════════════════════════
let _installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
  // أظهر زر التثبيت إذا موجود
  const btn = document.getElementById('installBtn');
  if(btn) btn.style.display = 'flex';
});

async function installPWA(){
  if(!_installPrompt) return;
  _installPrompt.prompt();
  const { outcome } = await _installPrompt.userChoice;
  if(outcome==='accepted'){
    const btn=document.getElementById('installBtn');
    if(btn) btn.style.display='none';
  }
  _installPrompt=null;
}
