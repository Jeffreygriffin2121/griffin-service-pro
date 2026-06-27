let photos={};
let signatures={engineer:null,customer:null};
let editingIndex=null;
const $ = id => document.getElementById(id);

function jobs(){return JSON.parse(localStorage.hpJobs||'[]')}
function setJobs(list){localStorage.hpJobs=JSON.stringify(list)}

function go(id,btn){
 document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
 $(id).classList.add('active');
 document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
 if(btn)btn.classList.add('active');
 window.scrollTo(0,0);
 render();
setTimeout(initSignaturePads,300);
 setTimeout(initSignaturePads,100);
}

function showJobStep(n,btn){
 document.querySelectorAll('.jobStep').forEach(s=>s.classList.remove('active'));
 $('jobStep'+n).classList.add('active');
 document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
 if(btn)btn.classList.add('active'); else { const pills=document.querySelectorAll('.pill'); if(pills[n-1]) pills[n-1].classList.add('active');}
 $('progressText').textContent='Step '+n+' of 6';
 $('progressBar').style.width=(n*16.66)+'%';
 window.scrollTo(0,0);
 if(n===6)setTimeout(initSignaturePads,100);
}

function newJob(){
 editingIndex=null; photos={}; signatures={engineer:null,customer:null};
 document.querySelectorAll('input,textarea').forEach(el=>{ if(el.type!=='checkbox' && el.type!=='file') el.value=''; if(el.type==='checkbox') el.checked=false; });
 document.querySelectorAll('.photoBox img').forEach(img=>{img.src='';img.style.display='none'});
 $('jobHeading').textContent='New Job';
 $('deleteBtn').classList.add('hidden');
 updateHealth(); go('job'); showJobStep(1); setTimeout(redrawSignatures,200);
}

function savePhoto(event,key){
 let file=event.target.files[0]; if(!file)return;
 let reader=new FileReader();
 reader.onload=function(e){
  let image=new Image();
  image.onload=function(){
   let max=900,w=image.width,h=image.height;
   if(w>h&&w>max){h=Math.round(h*(max/w));w=max}
   if(h>=w&&h>max){w=Math.round(w*(max/h));h=max}
   let canvas=document.createElement('canvas');
   canvas.width=w; canvas.height=h;
   canvas.getContext('2d').drawImage(image,0,0,w,h);
   let small=canvas.toDataURL('image/jpeg',0.55);
   photos[key]=small;
   let img=$(key+'Preview'); img.src=small; img.style.display='block';
  };
  image.src=e.target.result;
 };
 reader.readAsDataURL(file);
}


function setupCanvas(canvas,type){
 if(!canvas || canvas.dataset.ready)return;
 canvas.dataset.ready='true';
 const ctx=canvas.getContext('2d');
 let drawing=false;
 function resize(){
  const rect=canvas.getBoundingClientRect();
  const old=signatures[type];
  canvas.width=Math.max(1,Math.floor(rect.width*window.devicePixelRatio));
  canvas.height=Math.max(1,Math.floor(rect.height*window.devicePixelRatio));
  ctx.setTransform(window.devicePixelRatio,0,0,window.devicePixelRatio,0,0);
  ctx.lineWidth=3; ctx.lineCap='round'; ctx.strokeStyle='#0f172a';
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,rect.width,rect.height);
  if(old){let img=new Image(); img.onload=()=>ctx.drawImage(img,0,0,rect.width,rect.height); img.src=old;}
 }
 function point(e){const rect=canvas.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:t.clientX-rect.left,y:t.clientY-rect.top};}
 function start(e){e.preventDefault();drawing=true;let p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y)}
 function move(e){if(!drawing)return;e.preventDefault();let p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke();signatures[type]=canvas.toDataURL('image/png')}
 function end(){if(drawing){drawing=false;signatures[type]=canvas.toDataURL('image/png')}}
 canvas.addEventListener('mousedown',start);canvas.addEventListener('mousemove',move);window.addEventListener('mouseup',end);
 canvas.addEventListener('touchstart',start,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',end);
 resize(); window.addEventListener('resize',resize);
}

function initSignaturePads(){setupCanvas($('engineerCanvas'),'engineer'); setupCanvas($('customerCanvas'),'customer'); redrawSignatures();}
function redrawSignatures(){[['engineer','engineerCanvas'],['customer','customerCanvas']].forEach(([type,id])=>{let canvas=$(id); if(!canvas)return; let ctx=canvas.getContext('2d'), rect=canvas.getBoundingClientRect(); ctx.fillStyle='#fff'; ctx.fillRect(0,0,rect.width,rect.height); if(signatures[type]){let img=new Image(); img.onload=()=>ctx.drawImage(img,0,0,rect.width,rect.height); img.src=signatures[type];}})}
function clearSignature(type){signatures[type]=null; const canvas=$(type+'Canvas'); if(!canvas)return; const ctx=canvas.getContext('2d'), rect=canvas.getBoundingClientRect(); ctx.fillStyle='#fff'; ctx.fillRect(0,0,rect.width,rect.height);}

function nextJobNumber(){return 'HP-'+String(jobs().length+1).padStart(4,'0')}

function updateHealth(){
 let flow=parseFloat($('flowTemp').value),ret=parseFloat($('returnTemp').value),press=parseFloat($('pressure').value),rate=parseFloat($('flowRate').value),dhw=parseFloat($('hotWaterTemp').value),messages=[];
 if(!isNaN(flow)&&!isNaN(ret)){let dt=flow-ret; $('deltaT').value=dt.toFixed(1); if(dt>=3&&dt<=7)messages.push('✅ Delta T looks good'); else if(dt<3)messages.push('⚠️ Delta T low - check flow rate or heat transfer'); else messages.push('⚠️ Delta T high - check flow rate, pump speed or restrictions')} else $('deltaT').value='';
 if(!isNaN(press)){if(press>=1&&press<=2.5)messages.push('✅ System pressure acceptable'); else messages.push('⚠️ System pressure needs checking')}
 if(!isNaN(rate)){if(rate>=10)messages.push('✅ Flow rate recorded'); else messages.push('⚠️ Low flow rate - check pump speed, filters or restrictions')}
 if(!isNaN(dhw)){if(dhw>=48&&dhw<=60)messages.push('✅ Hot water temperature acceptable'); else messages.push('⚠️ Hot water temperature needs review')}
 $('healthBox').innerHTML=messages.length?'System Health:<br>'+messages.join('<br>'):'System Health: Enter readings';
}

function data(){
 return{
  jobNo: editingIndex===null ? nextJobNumber() : jobs()[editingIndex].jobNo,
  customer:$('customer').value,address:$('address').value,contact:$('contact').value,type:$('type').value,status:$('jobStatus').value,
  maker:$('maker').value,model:$('model').value,serial:$('serial').value,installDate:$('installDate').value,installer:$('installer').value,controllerVersion:$('controllerVersion').value,
  outdoorTemp:$('outdoorTemp').value,flowTemp:$('flowTemp').value,returnTemp:$('returnTemp').value,deltaT:$('deltaT').value,hotWaterTemp:$('hotWaterTemp').value,pressure:$('pressure').value,flowRate:$('flowRate').value,compressorHz:$('compressorHz').value,compressorAmps:$('compressorAmps').value,
  health:$('healthBox').innerText,photos:photos,signatures:signatures,faults:$('faults').value,notes:$('notes').value,checks:[...document.querySelectorAll('.check:checked')].map(x=>x.value),
  date: editingIndex===null ? new Date().toLocaleString() : jobs()[editingIndex].date, updated:new Date().toLocaleString()
 }
}

function saveJob(){
 updateHealth(); let list=jobs(); let item=data();
 try{ if(editingIndex===null) list.push(item); else list[editingIndex]=item; setJobs(list); alert(editingIndex===null?'Job saved.':'Job updated.'); editingIndex=null; photos={}; signatures={engineer:null,customer:null}; render(); go('home');}
 catch(e){alert('Job could not save because storage is full. Try fewer photos.')}
}

function openJob(i){
 const list=jobs(); const j=list[i]; editingIndex=i; photos=j.photos||{}; signatures=j.signatures||{engineer:null,customer:null};
 $('jobHeading').textContent='Edit '+(j.jobNo||'Job'); $('deleteBtn').classList.remove('hidden');
 ['customer','address','contact','type','jobStatus','maker','model','serial','installDate','installer','controllerVersion','outdoorTemp','flowTemp','returnTemp','deltaT','hotWaterTemp','pressure','flowRate','compressorHz','compressorAmps','faults','notes'].forEach(id=>{ if($(id)) $(id).value=j[id]||''; });
 document.querySelectorAll('.check').forEach(c=>c.checked=(j.checks||[]).includes(c.value));
 ['frontProperty','outdoorUnit','serialPlate','plantRoom','cylinder','electrical','finishedJob'].forEach(k=>{let img=$(k+'Preview'); if(photos[k]){img.src=photos[k];img.style.display='block'}else{img.src='';img.style.display='none'}});
 updateHealth(); go('job'); showJobStep(1); setTimeout(redrawSignatures,200);
}

function deleteCurrentJob(){ if(editingIndex===null)return; if(!confirm('Delete this job?'))return; let list=jobs(); list.splice(editingIndex,1); setJobs(list); editingIndex=null; photos={}; signatures={engineer:null,customer:null}; render(); go('home');}
function badgeClass(s){return s==='Completed'?'good':s==='Awaiting Parts'?'warn':s==='Call Back Required'?'bad':''}

function render(){
 let list=jobs();
 $('totalJobs').textContent=list.length;
 $('totalCustomers').textContent=[...new Set(list.map(j=>(j.customer||'').trim()).filter(Boolean))].length;
 $('drafts').innerHTML=list.length?list.slice().reverse().map((j,rev)=>{let i=list.length-1-rev;return `<p onclick="openJob(${i})"><b>${j.jobNo||'HP-0000'} - ${j.customer||'Unnamed customer'}</b><br>${j.maker||''} • ${j.model||'No model'}<br>${j.type||''} • ${j.date||''}<br><span class="badge ${badgeClass(j.status)}">${j.status||'In Progress'}</span></p>`}).join(''):'No jobs saved yet.';
 $('customersList').innerHTML=list.length?list.slice().reverse().map(j=>`<p><b>${j.customer||'Unnamed customer'}</b><br>${j.address||'No address saved'}<br>${j.contact||'No contact saved'}<br><small>${j.maker||''} • ${j.model||'No model'} • ${j.status||'In Progress'}</small></p>`).join(''):'Saved customers will appear here.';
}

function photoKeys(){return [['frontProperty','Front of Property'],['outdoorUnit','Outdoor Unit'],['serialPlate','Serial Plate'],['plantRoom','Plant Room'],['cylinder','Cylinder'],['electrical','Electrical'],['finishedJob','Finished Job']]}
function photoRecordText(){return photoKeys().map(([k,n])=>photos[k]?'✓ '+n+' photo captured':'□ '+n+' photo not captured').join('\n')}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function exportReport(){
 updateHealth(); let j=data();
 let text=`MUNSTER HEAT PUMP SERVICES\nHEATPUMP PRO SERVICE REPORT\n\nJob Number: ${j.jobNo}\nDate: ${j.date}\nUpdated: ${j.updated}\n\nCUSTOMER DETAILS\nCustomer: ${j.customer}\nAddress: ${j.address}\nContact: ${j.contact}\n\nSYSTEM DETAILS\nJob Type: ${j.type}\nJob Status: ${j.status}\nManufacturer: ${j.maker}\nModel: ${j.model}\nSerial Number: ${j.serial}\nInstallation Date: ${j.installDate}\nInstaller: ${j.installer}\nController Version: ${j.controllerVersion}\n\nSERVICE READINGS\nOutdoor Temperature: ${j.outdoorTemp} °C\nFlow Temperature: ${j.flowTemp} °C\nReturn Temperature: ${j.returnTemp} °C\nDelta T: ${j.deltaT} °C\nHot Water Temperature: ${j.hotWaterTemp} °C\nSystem Pressure: ${j.pressure} bar\nFlow Rate: ${j.flowRate} L/min\nCompressor Frequency: ${j.compressorHz} Hz\nCompressor Current: ${j.compressorAmps} A\n\nSYSTEM HEALTH\n${j.health}\n\nPHOTO RECORD\n${photoRecordText()}\n\nSERVICE CHECKS\n${j.checks.join('\n')}\n\nFAULTS / DIAGNOSIS\n${j.faults}\n\nENGINEER NOTES\n${j.notes}\n\nSignatures: Engineer ${j.signatures&&j.signatures.engineer?'captured':'not captured'}, Customer ${j.signatures&&j.signatures.customer?'captured':'not captured'}\n\nReport generated by HeatPump Pro`;
 let blob=new Blob([text],{type:'text/plain'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${j.jobNo}-HeatPump-Pro-Report.txt`;a.click();
}

function generatePDFReport(){
 updateHealth();
 let j=data();
 let checks=(j.checks||[]).map(c=>`<li>✓ ${esc(c)}</li>`).join('') || '<li>No checklist items selected</li>';
 let photoHtml=photoKeys().map(([k,n])=>{
   if(j.photos&&j.photos[k]) return `<div class="photoCard"><h4>${esc(n)}</h4><img src="${j.photos[k]}"></div>`;
   return `<div class="photoCard empty"><h4>${esc(n)}</h4><p>Photo not captured</p></div>`;
 }).join('');
 let engineerSig=j.signatures&&j.signatures.engineer?`<img src="${j.signatures.engineer}">`:'';
 let customerSig=j.signatures&&j.signatures.customer?`<img src="${j.signatures.customer}">`:'';
 let html=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(j.jobNo)} Report</title>
 <style>
 body{font-family:Arial,sans-serif;margin:0;color:#111827;background:#fff}
 .report{max-width:900px;margin:auto;padding:28px}
 .header{background:#0b6efd;color:#fff;padding:24px;border-radius:18px;margin-bottom:20px}
 .header small{text-transform:uppercase;letter-spacing:.12em}.header h1{margin:8px 0 0;font-size:30px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
 .box{border:1px solid #e5e7eb;border-radius:14px;padding:14px;margin:14px 0}.box h2{font-size:18px;margin:0 0 10px;color:#0b6efd}
 table{width:100%;border-collapse:collapse}td{border-bottom:1px solid #e5e7eb;padding:8px}td:first-child{font-weight:bold;color:#374151}
 .health{background:#eef6ff;border:1px solid #bfdbfe;border-radius:14px;padding:14px;white-space:pre-wrap;font-weight:bold}
 ul{margin:0;padding-left:20px}.photos{display:grid;grid-template-columns:1fr 1fr;gap:12px}.photoCard{border:1px solid #e5e7eb;border-radius:14px;padding:10px}.photoCard h4{margin:0 0 8px}.photoCard img{width:100%;max-height:260px;object-fit:cover;border-radius:10px}.empty{color:#64748b;background:#f9fafb}
 .signatures{display:grid;grid-template-columns:1fr 1fr;gap:12px}.sig{height:110px;border:1px dashed #94a3b8;border-radius:12px;margin-top:8px;display:flex;align-items:center;justify-content:center}.sig img{max-width:100%;max-height:100px}
 .footer{text-align:center;color:#64748b;margin-top:24px;font-size:12px}
 @media print{.report{padding:16px}.header{border-radius:0}.box{break-inside:avoid}.photoCard{break-inside:avoid}}
 </style></head><body><div class="report">
 <div class="header"><small>Munster Heat Pump Services</small><h1>HeatPump Pro Service Report</h1><div class="meta"><div><b>Job:</b> ${esc(j.jobNo)}</div><div><b>Date:</b> ${esc(j.updated||j.date)}</div></div></div>
 <div class="box"><h2>Customer Details</h2><table><tr><td>Customer</td><td>${esc(j.customer)}</td></tr><tr><td>Address</td><td>${esc(j.address)}</td></tr><tr><td>Contact</td><td>${esc(j.contact)}</td></tr></table></div>
 <div class="box"><h2>System Details</h2><table><tr><td>Job Type</td><td>${esc(j.type)}</td></tr><tr><td>Status</td><td>${esc(j.status)}</td></tr><tr><td>Manufacturer</td><td>${esc(j.maker)}</td></tr><tr><td>Model</td><td>${esc(j.model)}</td></tr><tr><td>Serial Number</td><td>${esc(j.serial)}</td></tr><tr><td>Installation Date</td><td>${esc(j.installDate)}</td></tr><tr><td>Controller Version</td><td>${esc(j.controllerVersion)}</td></tr></table></div>
 <div class="box"><h2>Service Readings</h2><table><tr><td>Outdoor Temperature</td><td>${esc(j.outdoorTemp)} °C</td></tr><tr><td>Flow Temperature</td><td>${esc(j.flowTemp)} °C</td></tr><tr><td>Return Temperature</td><td>${esc(j.returnTemp)} °C</td></tr><tr><td>Delta T</td><td>${esc(j.deltaT)} °C</td></tr><tr><td>Hot Water Temperature</td><td>${esc(j.hotWaterTemp)} °C</td></tr><tr><td>System Pressure</td><td>${esc(j.pressure)} bar</td></tr><tr><td>Flow Rate</td><td>${esc(j.flowRate)} L/min</td></tr><tr><td>Compressor Frequency</td><td>${esc(j.compressorHz)} Hz</td></tr><tr><td>Compressor Current</td><td>${esc(j.compressorAmps)} A</td></tr></table></div>
 <div class="box"><h2>System Health</h2><div class="health">${esc(j.health)}</div></div>
 <div class="box"><h2>Checklist</h2><ul>${checks}</ul></div>
 <div class="box"><h2>Faults / Diagnosis</h2><p>${esc(j.faults)}</p><h2>Engineer Notes</h2><p>${esc(j.notes)}</p></div>
 <div class="box"><h2>Photo Record</h2><div class="photos">${photoHtml}</div></div>
 <div class="box"><h2>Signatures</h2><div class="signatures"><div>Engineer Signature<div class="sig">${engineerSig}</div></div><div>Customer Signature<div class="sig">${customerSig}</div></div></div></div>
 <div class="footer">Report generated by HeatPump Pro • Munster Heat Pump Services</div>
 </div><script>window.onload=function(){setTimeout(function(){window.print()},500)}<\/script></body></html>`;
 let win=window.open('','_blank');
 if(!win){alert('Popup blocked. Allow popups to generate the PDF report.');return}
 win.document.open(); win.document.write(html); win.document.close();
}

render();
