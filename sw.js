// تنظيف النسخة القديمة: يمسح الكاش القديم ويلغي نفسه ويحوّل للنسخة الجديدة index7.html
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 for(const k of await caches.keys())await caches.delete(k);
 await self.registration.unregister();
 const cl=await self.clients.matchAll({type:'window'});
 cl.forEach(c=>c.navigate('./index7.html'));
})()));
