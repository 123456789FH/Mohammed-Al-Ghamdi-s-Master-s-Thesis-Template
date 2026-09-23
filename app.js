const AR = n => String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);

const stages = [
  {id:1,key:'aspire',title:'أطمح',subtitle:'تحديد الهدف والوجهة',icon:'🎯',cls:'s1',output:'هدف ذكي (SMART) واضح ومحدد وقابل للقياس',questions:['ماذا أطمح أن أحقق؟','كيف أريد أن أكون؟','ما الصورة التي أريدها لنفسي مستقبلاً؟','كيف سيكون تأثيري الإيجابي؟']},
  {id:2,key:'care',title:'أهتم',subtitle:'الاهتمامات والشغف',icon:'💡',cls:'s2',output:'قائمة باهتماماتي وشغفي ومواهبي ونقاط قوتي',questions:['ما الذي أستمتع به حقًا؟','ما المواد والأنشطة التي تجذبني؟','ما مواهبي ونقاط قوتي؟','ما القيم التي أؤمن بها؟','كيف أستطيع تحويل شغفي إلى فرصة؟']},
  {id:3,key:'connect',title:'أربط',subtitle:'اكتشاف الواقع والموارد',icon:'🧩',cls:'s3',output:'مصفوفة واقعية لربط الاهتمامات بالأهداف والفرص والموارد والتحديات',questions:['أين أنا الآن من هدفي؟','ما الموارد المتاحة لي؟ (مهارات، دعم، فرص)','ما التحديات المحتملة؟','من يمكن أن يساعدني؟','كيف أستفيد من تجاربي السابقة؟']},
  {id:4,key:'plan',title:'أخطط',subtitle:'صناعة الطريق',icon:'📋',cls:'s4',output:'خطة عمل واضحة (خطوات – مسؤوليات – جدول زمني)',questions:['ما الخطوات التي سأقوم بها؟','ما الأولويات؟','ما الأدوات والمهارات التي أحتاجها؟','ما الجدول الزمني للتنفيذ؟','كيف سأقيس تقدمي؟']},
  {id:5,key:'execute',title:'أنفذ',subtitle:'الالتزام والمتابعة',icon:'⚙️',cls:'s5',output:'تنفيذ فعّال + متابعة دورية وتقييم مستمر',questions:['ما أول خطوة سأبدأ بها؟','كيف سأحافظ على التزامي؟','ما المؤشرات التي تدل على تقدمي؟','كيف أقوّم نفسي وأعدل خطتي عند الحاجة؟']}
];

const weeklyItems=['مراجعة أهدافي وتحديثها','تحديد نشاط أو مهمة تدعم شغفي','تطبيق خطوة عملية من مرحلة الربط','تحديث خطة العمل والجدول الزمني','تنفيذ مهمة محددة من الخطة','مراجعة التقدم وتقييم الذات'];

const store = {
  get(){return JSON.parse(localStorage.getItem('masterCoachData')||'{"stages":{},"weekly":{},"profile":{}}')},
  set(v){localStorage.setItem('masterCoachData',JSON.stringify(v))},
  reset(){localStorage.removeItem('masterCoachData')}
};

let route='home';
let currentStage=1;
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
  if(route==='resources') renderSimple('📚','مكتبة الموارد','مساحة مخصصة لإضافة الأدلة، القوالب، الأمثلة، والمواد المساندة لكل مرحلة من مراحل الكوتشنج الطلابي.');
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

function renderSimple(icon,title,text){view.replaceChildren(cloneTemplate('simpleTemplate'));document.getElementById('simpleIcon').textContent=icon;document.getElementById('simpleTitle').textContent=title;document.getElementById('simpleText').textContent=text}
function renderProfile(){
  view.replaceChildren(cloneTemplate('simpleTemplate'));
  document.getElementById('simpleIcon').textContent='👤';document.getElementById('simpleTitle').textContent='ملفي';
  const box=document.getElementById('simpleText');box.innerHTML='';
  const form=document.createElement('form');form.className='coaching-form';form.innerHTML=`<label class="field-block"><span>اسم الطالب/المستفيد</span><input id="profileName" placeholder="اكتب الاسم"></label><label class="field-block"><span>الهدف العام</span><textarea id="profileGoal" rows="3" placeholder="اكتب الهدف العام"></textarea></label><button class="primary-btn" type="submit">حفظ الملف</button>`;
  box.appendChild(form);const data=store.get();document.getElementById('profileName').value=data.profile?.name||'';document.getElementById('profileGoal').value=data.profile?.goal||'';
  form.onsubmit=e=>{e.preventDefault();const d=store.get();d.profile={name:document.getElementById('profileName').value.trim(),goal:document.getElementById('profileGoal').value.trim()};store.set(d);toast('تم حفظ الملف')};
}

function wireJumps(){document.querySelectorAll('[data-route-jump]').forEach(b=>b.onclick=()=>{route=b.dataset.routeJump;render()})}
function toast(msg){const t=document.createElement('div');t.textContent=msg;t.style.cssText='position:fixed;z-index:999;left:50%;bottom:92px;transform:translateX(-50%);background:#13080d;color:#ffe8a0;border:1px solid #c99747;padding:12px 18px;border-radius:999px;box-shadow:0 10px 30px #0008';document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{route=b.dataset.route;render()}));
document.getElementById('resetBtn').onclick=()=>{if(confirm('هل تريد إعادة ضبط جميع الإجابات والتقدم؟')){store.reset();route='home';render()}};
document.getElementById('menuBtn').onclick=()=>toast('القائمة الرئيسية');

render();
