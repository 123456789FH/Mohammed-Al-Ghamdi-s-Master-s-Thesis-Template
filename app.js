const AR = n => String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);

const stages = [
  {id:1,key:'aspire',title:'أطمح',subtitle:'تحديد الهدف والوجهة',icon:'🎯',cls:'s1',output:'هدف ذكي (SMART) واضح ومحدد وقابل للقياس',questions:['ماذا أطمح أن أحقق؟','كيف أريد أن أكون؟','ما الصورة التي أريدها لنفسي مستقبلاً؟','كيف سيكون تأثيري الإيجابي؟']},
  {id:2,key:'interest',title:'أهتم',subtitle:'الاهتمامات والشغف',icon:'💡',cls:'s2',output:'قائمة باهتماماتي وشغفي ومواهبي ونقاط قوتي',questions:['ما الذي أستمتع به حقًا؟','ما المواد والأنشطة التي تجذبني؟','ما مواهبي ونقاط قوتي؟','ما القيم التي أؤمن بها؟','كيف أستطيع تحويل شغفي إلى فرصة؟']},
  {id:3,key:'connect',title:'أربط',subtitle:'اكتشاف الواقع والموارد',icon:'🧩',cls:'s3',output:'مصفوفة واقعية لربط الاهتمامات بالأهداف والفرص والموارد والتحديات',questions:['أين أنا الآن من هدفي؟','ما الموارد المتاحة لي؟ (مهارات، دعم، فرص)','ما التحديات المحتملة؟','من يمكن أن يساعدني؟','كيف أستفيد من تجاربي السابقة؟']},
  {id:4,key:'plan',title:'أخطط',subtitle:'صناعة الطريق',icon:'📋',cls:'s4',output:'خطة عمل واضحة (خطوات – مسؤوليات – جدول زمني)',questions:['ما الخطوات التي سأقوم بها؟','ما الأولويات؟','ما الأدوات والمهارات التي أحتاجها؟','ما الجدول الزمني للتنفيذ؟','كيف سأقيس تقدمي؟']},
  {id:5,key:'execute',title:'أنفذ',subtitle:'الالتزام والمتابعة',icon:'⚙️',cls:'s5',output:'تنفيذ فعّال + متابعة دورية وتقييم مستمر',questions:['ما أول خطوة سأبدأ بها؟','كيف سأحافظ على التزامي؟','ما المؤشرات التي تدل على تقدمي؟','كيف أقوّم نفسي وأعدل خطتي عند الحاجة؟']}
];

const weeklyItems=['مراجعة أهدافي وتحديثها','تحديد نشاط أو مهمة تدعم شغفي','تطبيق خطوة عملية من مرحلة الربط','تحديث خطة العمل والجدول الزمني','تنفيذ مهمة محددة من الخطة','مراجعة التقدم وتقييم الذات'];
const resourceCategories=['الكل','عام','أطمح','أهتم','أربط','أخطط','أنفذ'];
const starterResources=[
  {id:'starter-smart',title:'قالب الهدف الذكي SMART',description:'قالب مختصر يساعد المستفيد على صياغة هدف واضح ومحدد وقابل للقياس.',category:'أطمح',kind:'static',url:'resources/smart-goal-template.html',type:'text/html',source:'مورد أساسي'},
  {id:'starter-session',title:'ورقة جلسة الكوتشنج الطلابي',description:'ورقة عمل منظمة لتدوين محاور الجلسة والملاحظات والخطوة التالية.',category:'عام',kind:'static',url:'resources/coaching-session-sheet.html',type:'text/html',source:'مورد أساسي'},
  {id:'starter-plan',title:'قالب خطة الطريق',description:'قالب عملي لتحويل الهدف إلى خطوات ومسؤوليات وجدول زمني ومؤشر قياس.',category:'أخطط',kind:'static',url:'resources/action-plan-template.html',type:'text/html',source:'مورد أساسي'}
];

const store = {
  get(){return JSON.parse(localStorage.getItem('masterCoachData')||'{"stages":{},"weekly":{},"profile":{},"links":[]}')},
  set(v){localStorage.setItem('masterCoachData',JSON.stringify(v))},
  reset(){localStorage.removeItem('masterCoachData')}
};

let route='home';
let currentStage=1;
let resourceFilter='الكل';
let resourceQuery='';
let deferredInstallPrompt=null;
const view=document.getElementById('view');

function stageData(id){const data=store.get();return data.stages?.[id]||{answers:[],notes:''}}
function stagePercent(id){
  const s=stages.find(x=>x.id===id), d=stageData(id);
  const answered=(d.answers||[]).filter(x=>String(x||'').trim().length>0).length;
  const notes=String(d.notes||'').trim()?0.25:0;
  return Math.min(100,Math.round(((answered+notes)/s.questions.length)*100));
}
function totalPercent(){return Math.round(stages.reduce((a,s)=>a+stagePercent(s.id),0)/stages.length)}
function setRing(el,p){if(el)el.style.setProperty('--p',`${p*3.6}deg`)}
function navActive(){document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route===route))}
function cloneTemplate(id){return document.getElementById(id).content.cloneNode(true)}

function render(){
  navActive();
  if(route==='home') renderHome();
  if(route==='stages') renderStages();
  if(route==='stage') renderStageDetail();
  if(route==='progress') renderProgress();
  if(route==='resources') renderResources();
  if(route==='profile') renderProfile();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderHome(){
  view.replaceChildren(cloneTemplate('homeTemplate'));
  const p=totalPercent();
  document.getElementById('homePercent').textContent=`${AR(p)}٪`;
  setRing(document.getElementById('homeRing'),p);
  const wrap=document.getElementById('homeStages');
  stages.forEach(s=>{
    const btn=document.createElement('button');btn.className=`stage-card ${s.cls} ${stagePercent(s.id)===100?'done':''}`;
    btn.innerHTML=`<span class="num">${AR(s.id)}</span><div class="stage-icon">${s.icon}</div><h4>${s.title}</h4><p>${s.subtitle}</p>`;
    btn.addEventListener('click',()=>openStage(s.id));wrap.appendChild(btn);
  });
  document.querySelector('[data-action="start"]').onclick=()=>openStage(firstIncompleteStage());
  document.getElementById('homeInstallBtn').onclick=installApp;
  refreshInstallUI();
  wireJumps();
}
function firstIncompleteStage(){return (stages.find(s=>stagePercent(s.id)<100)||stages[0]).id}

function renderStages(){
  view.replaceChildren(cloneTemplate('stagesTemplate'));
  document.getElementById('stagesPercent').textContent=`${AR(totalPercent())}٪`;
  const list=document.getElementById('stageList');
  stages.forEach(s=>{
    const row=document.createElement('article');row.className=`stage-row ${s.cls}`;
    row.innerHTML=`<div class="stage-icon">${s.icon}</div><div><h3>${AR(s.id)}. ${s.title}</h3><p>${s.subtitle}</p><div class="output"><b>المخرج:</b> ${s.output}</div><div class="muted" style="color:#32190c;margin-top:8px">الإنجاز: ${AR(stagePercent(s.id))}٪</div></div><button aria-label="فتح المرحلة">‹</button>`;
    row.querySelector('button').onclick=()=>openStage(s.id);list.appendChild(row);
  });
}
function openStage(id){currentStage=id;route='stage';render()}

function renderStageDetail(){
  const s=stages.find(x=>x.id===currentStage); const d=stageData(s.id);
  view.replaceChildren(cloneTemplate('stageDetailTemplate'));
  const head=document.getElementById('detailHead');head.style.borderColor=getComputedStyle(document.documentElement).getPropertyValue(`--s${s.id}`);
  document.getElementById('detailIcon').textContent=s.icon;
  document.getElementById('detailStep').textContent=`المرحلة ${AR(s.id)} من ${AR(stages.length)}`;
  document.getElementById('detailTitle').textContent=s.title;
  document.getElementById('detailSubtitle').textContent=s.subtitle;
  document.getElementById('outputText').textContent=s.output;
  const prog=document.getElementById('detailProgress');
  stages.forEach(x=>{const dot=document.createElement('span');dot.className=`step-dot ${x.id<=s.id?'active':''}`;prog.appendChild(dot)});
  const fields=document.getElementById('questionFields');
  s.questions.forEach((q,i)=>{
    const label=document.createElement('label');label.className='field-block';
    label.innerHTML=`<span>${q}</span><textarea rows="3" data-q="${i}" placeholder="اكتب إجابتك هنا...">${escapeHtml((d.answers||[])[i]||'')}</textarea>`;
    fields.appendChild(label);
  });
  document.getElementById('notes').value=d.notes||'';
  document.getElementById('coachingForm').onsubmit=e=>{e.preventDefault();saveCurrentStage(true)};
  document.getElementById('prevStage').onclick=()=>{saveCurrentStage(false);if(currentStage>1)openStage(currentStage-1);else{route='stages';render()}};
  document.getElementById('nextStage').onclick=()=>{saveCurrentStage(false);if(currentStage<5)openStage(currentStage+1);else{route='progress';render()}};
  wireJumps();
}
function saveCurrentStage(showToast){
  const data=store.get();data.stages=data.stages||{};
  data.stages[currentStage]={answers:[...document.querySelectorAll('[data-q]')].map(t=>t.value.trim()),notes:document.getElementById('notes').value.trim(),updatedAt:new Date().toISOString()};
  store.set(data);if(showToast)toast('تم حفظ إجاباتك بنجاح');
}

function renderProgress(){
  view.replaceChildren(cloneTemplate('progressTemplate'));
  const p=totalPercent();document.getElementById('progressPercent').textContent=`${AR(p)}٪`;setRing(document.getElementById('progressRing'),p);
  document.getElementById('progressMessage').textContent=p===100?'أحسنت! أكملت جميع مراحل النموذج.':p>=60?'تقدم ممتاز، واصل العمل على المراحل المتبقية.':p>0?'بداية موفقة، استمر خطوة بخطوة.':'ابدأ الآن، ومستقبلك ينتظرك.';
  const ps=document.getElementById('progressStages');
  stages.forEach(s=>{const el=document.createElement('div');el.className=`progress-stage ${s.cls}`;const sp=stagePercent(s.id);el.innerHTML=`<div>${s.icon}</div><div>${s.title}</div><small>${AR(sp)}٪</small>`;el.onclick=()=>openStage(s.id);ps.appendChild(el)});
  const data=store.get();data.weekly=data.weekly||{};const wc=document.getElementById('weeklyChecklist');
  weeklyItems.forEach((item,i)=>{const row=document.createElement('label');row.className='check-item';row.innerHTML=`<input type="checkbox" ${data.weekly[i]?'checked':''}><span>${item}</span>`;row.querySelector('input').onchange=e=>{const d=store.get();d.weekly=d.weekly||{};d.weekly[i]=e.target.checked;store.set(d)};wc.appendChild(row)});
  document.getElementById('clearChecklist').onclick=()=>{const d=store.get();d.weekly={};store.set(d);renderProgress()};
  const bg=document.getElementById('badges');
  stages.forEach(s=>{const unlocked=stagePercent(s.id)>=80;const b=document.createElement('div');b.className=`badge ${unlocked?'':'locked'}`;b.innerHTML=`<div class="badge-icon">${s.icon}</div><strong>${badgeName(s.id)}</strong>`;bg.appendChild(b)});
}
function badgeName(id){return ['طموح واضح','اهتمام حقيقي','مفكر مترابط','مخطط واعد','منفذ متميز'][id-1]}

/* ---------------- Resources / IndexedDB ---------------- */
const resourceDB={
  db:null,
  open(){
    if(this.db) return Promise.resolve(this.db);
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open('masterCoachResources',1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('files')) db.createObjectStore('files',{keyPath:'id',autoIncrement:true})};
      req.onsuccess=()=>{this.db=req.result;resolve(this.db)};req.onerror=()=>reject(req.error);
    });
  },
  async all(){const db=await this.open();return new Promise((resolve,reject)=>{const req=db.transaction('files','readonly').objectStore('files').getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)})},
  async add(item){const db=await this.open();return new Promise((resolve,reject)=>{const req=db.transaction('files','readwrite').objectStore('files').add(item);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})},
  async del(id){const db=await this.open();return new Promise((resolve,reject)=>{const req=db.transaction('files','readwrite').objectStore('files').delete(id);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error)})},
  async clear(){const db=await this.open();return new Promise((resolve,reject)=>{const req=db.transaction('files','readwrite').objectStore('files').clear();req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error)})}
};

async function getAllResources(){
  let local=[];try{local=await resourceDB.all()}catch(e){console.warn('IndexedDB unavailable',e)}
  const links=(store.get().links||[]).map(x=>({...x,kind:'link',source:'محفوظ على هذا الجهاز'}));
  return [...starterResources,...links,...local.map(x=>({...x,kind:'file',source:'محفوظ على هذا الجهاز'}))];
}
function resourceIcon(r){
  if(r.kind==='link') return '🔗';
  const t=(r.type||'').toLowerCase(), n=(r.name||r.title||'').toLowerCase();
  if(t.includes('pdf')||n.endsWith('.pdf')) return '📕';
  if(t.includes('word')||n.match(/\.docx?$/)) return '📝';
  if(t.includes('presentation')||n.match(/\.pptx?$/)) return '📊';
  if(t.includes('spreadsheet')||n.match(/\.xlsx?$/)) return '📈';
  if(t.startsWith('image/')||n.match(/\.(png|jpe?g|webp|gif)$/)) return '🖼️';
  if(t.startsWith('video/')||n.match(/\.(mp4|mov|m4v)$/)) return '🎬';
  if(n.endsWith('.zip')) return '🗜️';
  return '📄';
}
function formatBytes(bytes=0){if(!bytes)return '';const units=['ب','ك.ب','م.ب','ج.ب'];let i=0,n=bytes;while(n>=1024&&i<units.length-1){n/=1024;i++}return `${AR(n.toFixed(n<10&&i>0?1:0))} ${units[i]}`}

async function renderResources(){
  view.replaceChildren(cloneTemplate('resourcesTemplate'));
  document.getElementById('addResourceBtn').onclick=openResourceDialog;
  const filters=document.getElementById('resourceFilters');
  resourceCategories.forEach(cat=>{const b=document.createElement('button');b.className=`filter-chip ${resourceFilter===cat?'active':''}`;b.textContent=cat;b.onclick=()=>{resourceFilter=cat;renderResources()};filters.appendChild(b)});
  const search=document.getElementById('resourceSearch');search.value=resourceQuery;search.oninput=()=>{resourceQuery=search.value.trim();drawResources()};
  await drawResources();
}
async function drawResources(){
  const grid=document.getElementById('resourceGrid');if(!grid)return;
  const all=await getAllResources();
  const q=resourceQuery.toLowerCase();
  const visible=all.filter(r=>(resourceFilter==='الكل'||r.category===resourceFilter)&&(!q||`${r.title} ${r.description||''} ${r.category||''}`.toLowerCase().includes(q)));
  grid.innerHTML='';
  const localCount=all.filter(r=>r.source==='محفوظ على هذا الجهاز').length;
  document.getElementById('resourceStats').innerHTML=`<span class="stat-pill">${AR(all.length)} موارد</span><span class="stat-pill">${AR(localCount)} محلي</span><span class="stat-pill">${AR(starterResources.length)} داخل المستودع</span>`;
  document.getElementById('resourceEmpty').hidden=visible.length!==0;
  visible.forEach(r=>{
    const card=document.createElement('article');card.className='glass resource-card';
    const local=r.source==='محفوظ على هذا الجهاز';
    const size=r.size?`<span class="resource-badge">${formatBytes(r.size)}</span>`:'';
    card.innerHTML=`<div class="resource-card-head"><div class="resource-type-icon">${resourceIcon(r)}</div><span class="resource-badge ${local?'local':''}">${escapeHtml(r.source||'مورد')}</span></div><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.description||'مورد مساعد في رحلة الكوتشنج الطلابي.')}</p><div class="resource-meta"><span class="resource-badge">${escapeHtml(r.category||'عام')}</span>${size}</div><div class="resource-actions"></div>`;
    const actions=card.querySelector('.resource-actions');
    const open=document.createElement('button');open.className='resource-open';open.textContent='فتح';open.onclick=()=>openResource(r);actions.appendChild(open);
    if(r.kind==='file'||r.kind==='static'){
      const dl=document.createElement('button');dl.className='resource-download';dl.textContent='تحميل';dl.onclick=()=>downloadResource(r);actions.appendChild(dl);
    }
    if(navigator.share){const sh=document.createElement('button');sh.className='resource-share';sh.textContent='مشاركة';sh.onclick=()=>shareResource(r);actions.appendChild(sh)}
    if(local){const del=document.createElement('button');del.className='resource-delete';del.textContent='حذف';del.onclick=()=>deleteResource(r);actions.appendChild(del)}
    grid.appendChild(card);
  });
}
function openResourceDialog(){
  const dlg=document.getElementById('resourceDialog');
  document.getElementById('resourceForm').reset();document.getElementById('resourceMode').value='file';setResourceMode('file');dlg.showModal();
}
function setResourceMode(mode){
  document.getElementById('resourceMode').value=mode;
  document.querySelectorAll('[data-resource-mode]').forEach(b=>b.classList.toggle('active',b.dataset.resourceMode===mode));
  document.getElementById('resourceFileField').hidden=mode!=='file';document.getElementById('resourceLinkField').hidden=mode!=='link';
}
async function saveResource(e){
  e.preventDefault();
  const mode=document.getElementById('resourceMode').value,title=document.getElementById('resourceTitle').value.trim(),category=document.getElementById('resourceCategory').value,description=document.getElementById('resourceDescription').value.trim();
  if(!title)return toast('اكتب عنوان المورد');
  try{
    if(mode==='file'){
      const file=document.getElementById('resourceFile').files[0];if(!file)return toast('اختر ملفًا أولًا');
      if(file.size>100*1024*1024 && !confirm('حجم الملف أكبر من ١٠٠ م.ب. وقد لا يسمح المتصفح بحفظه محليًا. هل تريد المتابعة؟'))return;
      if(navigator.storage?.persist) navigator.storage.persist().catch(()=>{});
      await resourceDB.add({title,category,description,name:file.name,type:file.type||'application/octet-stream',size:file.size,blob:file,createdAt:new Date().toISOString()});
    }else{
      const url=document.getElementById('resourceUrl').value.trim();if(!url)return toast('أدخل رابط المورد');
      const d=store.get();d.links=d.links||[];d.links.push({id:`link-${Date.now()}`,title,category,description,url,createdAt:new Date().toISOString()});store.set(d);
    }
    document.getElementById('resourceDialog').close();toast('تمت إضافة المورد');await drawResources();
  }catch(err){console.error(err);toast('تعذر حفظ المورد على هذا الجهاز')}
}
async function openResource(r){
  if(r.kind==='link'||r.kind==='static'){window.open(r.url,'_blank','noopener');return}
  const url=URL.createObjectURL(r.blob);window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function downloadResource(r){
  let url,name;
  if(r.kind==='static'){url=r.url;name=(r.url.split('/').pop()||'resource')}
  else if(r.kind==='file'){url=URL.createObjectURL(r.blob);name=r.name||r.title}
  else return;
  const a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();if(r.kind==='file')setTimeout(()=>URL.revokeObjectURL(url),3000);
}
async function shareResource(r){
  try{
    if(r.kind==='file'&&navigator.canShare){const f=new File([r.blob],r.name||r.title,{type:r.type||'application/octet-stream'});if(navigator.canShare({files:[f]})){await navigator.share({title:r.title,text:r.description||'',files:[f]});return}}
    const url=r.kind==='file'?location.href:new URL(r.url,location.href).href;await navigator.share({title:r.title,text:r.description||'',url});
  }catch(e){if(e?.name!=='AbortError')toast('المشاركة غير متاحة لهذا المورد')}
}
async function deleteResource(r){
  if(!confirm(`حذف «${r.title}» من هذا الجهاز؟`))return;
  if(r.kind==='file') await resourceDB.del(r.id);
  if(r.kind==='link'){const d=store.get();d.links=(d.links||[]).filter(x=>x.id!==r.id);store.set(d)}
  toast('تم حذف المورد');await drawResources();
}

function renderProfile(){
  view.replaceChildren(cloneTemplate('simpleTemplate'));
  document.getElementById('simpleIcon').textContent='👤';document.getElementById('simpleTitle').textContent='ملفي';
  const box=document.getElementById('simpleText');box.innerHTML='';
  const form=document.createElement('form');form.className='coaching-form';form.innerHTML=`<label class="field-block"><span>اسم الطالب/المستفيد</span><input id="profileName" placeholder="اكتب الاسم"></label><label class="field-block"><span>الهدف العام</span><textarea id="profileGoal" rows="3" placeholder="اكتب الهدف العام"></textarea></label><button class="primary-btn" type="submit">حفظ الملف</button><button class="secondary-btn" type="button" id="profileInstallBtn" style="margin-inline-start:8px">تثبيت التطبيق على الجهاز</button>`;
  box.appendChild(form);const data=store.get();document.getElementById('profileName').value=data.profile?.name||'';document.getElementById('profileGoal').value=data.profile?.goal||'';
  form.onsubmit=e=>{e.preventDefault();const d=store.get();d.profile={name:document.getElementById('profileName').value.trim(),goal:document.getElementById('profileGoal').value.trim()};store.set(d);toast('تم حفظ الملف')};
  document.getElementById('profileInstallBtn').onclick=installApp;
}

/* ---------------- PWA installation ---------------- */
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function isSafari(){return /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent)}
function refreshInstallUI(){
  const installed=isStandalone();
  const mini=document.getElementById('installBtn');if(mini) mini.style.display=installed?'none':'';
  const card=document.getElementById('installCard');if(card) card.classList.toggle('installed',installed);
  const homeBtn=document.getElementById('homeInstallBtn');if(homeBtn&&installed)homeBtn.textContent='التطبيق مثبت';
}
async function installApp(){
  if(isStandalone()){toast('التطبيق مثبت بالفعل على هذا الجهاز');return}
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();const choice=await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;if(choice.outcome==='accepted')toast('تم بدء تثبيت التطبيق');refreshInstallUI();return;
  }
  showInstallInstructions();
}
function showInstallInstructions(){
  const box=document.getElementById('installInstructions');
  if(isIOS()){
    box.innerHTML=`<p>على الآيفون أو الآيباد افتح التطبيق في <b>Safari</b> ثم:</p><div class="install-steps"><div class="install-step"><span class="install-step-num">١</span><div>اضغط زر <b>المشاركة</b> ⤴ في شريط Safari.</div></div><div class="install-step"><span class="install-step-num">٢</span><div>اختر <b>إضافة إلى الشاشة الرئيسية</b>.</div></div><div class="install-step"><span class="install-step-num">٣</span><div>اضغط <b>إضافة</b>. ستظهر أيقونة «الماستر كوتش» كتطبيق مستقل.</div></div></div>`;
  }else if(isSafari()){
    box.innerHTML=`<p>في Safari على Mac، استخدم خيار <b>إضافة إلى Dock</b> من قائمة ملف/المشاركة إن كان متاحًا. وفي Chrome أو Edge افتح قائمة المتصفح واختر <b>تثبيت التطبيق</b>.</p>`;
  }else{
    box.innerHTML=`<p>إذا لم يظهر مربع التثبيت تلقائيًا، افتح قائمة المتصفح وابحث عن <b>تثبيت التطبيق</b> أو <b>Install app</b> أو <b>إضافة إلى الشاشة الرئيسية</b>.</p>`;
  }
  document.getElementById('installDialog').showModal();
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;refreshInstallUI()});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;toast('تم تثبيت التطبيق بنجاح');refreshInstallUI()});

function wireJumps(){document.querySelectorAll('[data-route-jump]').forEach(b=>b.onclick=()=>{route=b.dataset.routeJump;render()})}
function toast(msg){const t=document.createElement('div');t.textContent=msg;t.style.cssText='position:fixed;z-index:9999;left:50%;bottom:92px;transform:translateX(-50%);background:#13080d;color:#ffe8a0;border:1px solid #c99747;padding:12px 18px;border-radius:999px;box-shadow:0 10px 30px #0008;max-width:90vw;text-align:center';document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

/* Global events */
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{route=b.dataset.route;render()}));
document.getElementById('resetBtn').onclick=async()=>{if(confirm('هل تريد إعادة ضبط إجابات المراحل والتقدم؟ لن تُحذف ملفات مكتبة الموارد المحلية.')){store.reset();route='home';render()}};
document.getElementById('menuBtn').onclick=()=>toast('استخدم شريط التنقل للوصول إلى أقسام التطبيق');
document.getElementById('installBtn').onclick=installApp;
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.closeDialog).close());
document.querySelectorAll('[data-resource-mode]').forEach(b=>b.onclick=()=>setResourceMode(b.dataset.resourceMode));
document.getElementById('resourceForm').addEventListener('submit',saveResource);

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(err=>console.warn('Service worker registration failed',err)))}
render();refreshInstallUI();
