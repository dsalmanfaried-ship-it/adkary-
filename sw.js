const V='adkari-v3',
FONT_CSS='https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@500;800&display=swap',
F=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];

async function precache(){
 const c=await caches.open(V);
 // ملفات التطبيق: لو واحد ناقص مايوقفش الباقي
 await Promise.all(F.map(u=>c.add(u).catch(()=>{})));
 // الخطوط: نحمّل ملف الـ CSS وكل ملفات الخط اللي جواه عشان تشتغل من غير نت
 try{
  const r=await fetch(FONT_CSS);
  if(r.ok){
   const css=await r.clone().text();
   await c.put(FONT_CSS,r);
   const urls=[...new Set([...css.matchAll(/url\(["']?(https:[^)"']+)/g)].map(m=>m[1]))];
   await Promise.all(urls.map(u=>fetch(u).then(x=>x.ok&&c.put(u,x)).catch(()=>{})));
  }
 }catch(e){}
}

self.addEventListener('install',e=>{e.waitUntil(precache().then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});

// الكاش أولًا (يشتغل من غير نت)، وبيتحدّث في الخلفية لما يكون فيه نت
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 e.respondWith(caches.match(e.request).then(hit=>{
  const net=fetch(e.request).then(res=>{
   const u=new URL(e.request.url);
   if(res.ok&&(u.origin===location.origin||u.host.includes('gstatic')||u.host.includes('googleapis'))){
    const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp));
   }
   return res;
  }).catch(()=>hit||caches.match('./index.html'));
  if(hit){e.waitUntil(net.catch(()=>{}));return hit}
  return net;
 }));
});
