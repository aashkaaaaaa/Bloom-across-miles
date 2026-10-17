/* Builder: flower grid, default arrangement, drag/rotate/scale handles, flower actions, wrap and ribbon tabs, note */

function goToBuilder(){showScreen('builder');}
function backToBuilder(){showScreen('builder');}

function buildGrid(){
  document.getElementById('flowerGrid').innerHTML=FLOWERS.map(f=>`
    <button onclick="addFlower('${f.id}')" style="background:#fffdfb;border:1px solid #efe2df;border-radius:12px;padding:8px 4px 6px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;transition:border-color .15s;text-align:center;" onmouseover="this.style.borderColor='#f29ca3'" onmouseout="this.style.borderColor='#efe2df'">
      <div style="width:44px;height:54px;display:flex;align-items:center;justify-content:center;">
        <svg viewBox="-80 -160 160 320" style="width:100%;height:100%;overflow:visible;">${f.svg}</svg>
      </div>
      <span style="font-size:9px;font-weight:600;color:#5c4b49;line-height:1.2;">${f.name}</span>
    </button>`).join('');
}

function defaultStems(){
  return [
    {uid:'s1',id:'cherry_blossom',x:215,y:275,r:-24,sc:1.05,fx:false},
    {uid:'s2',id:'delphinium',x:385,y:275,r:22,sc:1.05,fx:false},
    {uid:'s3',id:'daffodil',x:255,y:265,r:-12,sc:1.0,fx:false},
    {uid:'s4',id:'mimosa',x:345,y:258,r:10,sc:1.05,fx:false},
    {uid:'s5',id:'forget_me_not',x:300,y:248,r:-3,sc:1.05,fx:false},
    {uid:'s6',id:'yellow_rose',x:265,y:305,r:-10,sc:1.05,fx:false},
    {uid:'s7',id:'pink_rose',x:340,y:312,r:12,sc:1.05,fx:false},
    {uid:'s8',id:'pink_tulip',x:225,y:318,r:-22,sc:1.0,fx:false},
    {uid:'s9',id:'peach_tulip',x:382,y:322,r:24,sc:1.0,fx:true},
    {uid:'s10',id:'lily_valley',x:302,y:320,r:2,sc:1.0,fx:false}
  ];
}

function loadDefault(){S.stems=defaultStems();selUid='s7';render();}

function setupEvents(){
  const svg=document.getElementById('mainSvg');
  svg.addEventListener('pointerdown',e=>{
    if(e.target.closest('.action-btn'))return;
    const g=e.target.closest('[data-gizmo]');
    if(g&&selUid){
      e.stopPropagation();e.preventDefault();
      const mode=g.getAttribute('data-gizmo');
      const s=S.stems.find(st=>st.uid===selUid);if(!s)return;
      const pt=svgPt(svg,e.clientX,e.clientY);
      if(mode==='rotate'){dragCtx={mode:'rotate',uid:selUid,startAngle:Math.atan2(pt.y-s.y,pt.x-s.x)*180/Math.PI,origR:s.r};feedback=`${Math.round(s.r)}°`;}
      else if(mode==='scale'){dragCtx={mode:'scale',uid:selUid,startDist:Math.max(20,Math.hypot(pt.x-s.x,pt.y-s.y)),origSc:s.sc};feedback=`${Math.round(s.sc*100)}%`;}
      else{dragCtx={mode:'move',uid:selUid,sx:pt.x,sy:pt.y,ox:s.x,oy:s.y};}
      svg.setPointerCapture(e.pointerId);render();return;
    }
    const fe=e.target.closest('.flower-entity');
    if(fe){
      e.stopPropagation();
      const uid=fe.getAttribute('data-uid');selUid=uid;
      const s=S.stems.find(st=>st.uid===uid);if(!s)return;
      const pt=svgPt(svg,e.clientX,e.clientY);
      dragCtx={mode:'move',uid,sx:pt.x,sy:pt.y,ox:s.x,oy:s.y};
      svg.setPointerCapture(e.pointerId);render();return;
    }
    if(!e.target.closest('#tagLayer')){if(selUid!==null){selUid=null;feedback=null;render();}}
  });
  svg.addEventListener('pointermove',e=>{
    if(!dragCtx)return;
    const pt=svgPt(svg,e.clientX,e.clientY);
    const s=S.stems.find(st=>st.uid===dragCtx.uid);if(!s)return;
    if(dragCtx.mode==='move'){s.x=Math.max(60,Math.min(540,Math.round(dragCtx.ox+pt.x-dragCtx.sx)));s.y=Math.max(80,Math.min(580,Math.round(dragCtx.oy+pt.y-dragCtx.sy)));}
    else if(dragCtx.mode==='rotate'){const ca=Math.atan2(pt.y-s.y,pt.x-s.x)*180/Math.PI;let nr=dragCtx.origR+ca-dragCtx.startAngle;nr=((nr+180)%360+360)%360-180;s.r=Math.round(nr);feedback=`${s.r}°`;}
    else if(dragCtx.mode==='scale'){const cd=Math.max(15,Math.hypot(pt.x-s.x,pt.y-s.y));s.sc=parseFloat(Math.max(0.35,Math.min(2.2,dragCtx.origSc*cd/dragCtx.startDist)).toFixed(2));feedback=`${Math.round(s.sc*100)}%`;}
    render();
  });
  svg.addEventListener('pointerup',()=>{dragCtx=null;feedback=null;render();});
  svg.addEventListener('pointercancel',()=>{dragCtx=null;feedback=null;render();});
  svg.addEventListener('wheel',e=>{
    e.preventDefault();if(!selUid)return;
    const s=S.stems.find(st=>st.uid===selUid);if(!s)return;
    if(e.shiftKey){const st=e.deltaY>0?5:-5;s.r=Math.round(((s.r+st+180)%360+360)%360-180);}
    else{const st=e.deltaY<0?.06:-.06;s.sc=parseFloat(Math.max(0.35,Math.min(2.2,s.sc+st)).toFixed(2));}
    render();
  },{passive:false});
}

function svgPt(svg,cx,cy){const pt=svg.createSVGPoint();pt.x=cx;pt.y=cy;return pt.matrixTransform(svg.getScreenCTM().inverse());}

function updatePill(){const s=S.stems.find(st=>st.uid===selUid);const def=s?FLOWERS.find(f=>f.id===s.id):null;document.getElementById('flowerName').textContent=def?def.name:'Tap any flower';document.getElementById('flowerMeaning').textContent=def?`"${def.meaning}"`:'Drag handles on the flower to tilt & resize';}

function addFlower(id){const uid='f'+Date.now()+'_'+Math.floor(Math.random()*999);const sp=300+(Math.random()*120-60);S.stems.push({uid,id,x:Math.round(sp),y:Math.round(265+Math.random()*60-30),r:Math.round((sp-300)*.25+(Math.random()*10-5)),sc:1.0,fx:Math.random()>.75});selUid=uid;render();}

function flipSel(){const s=S.stems.find(st=>st.uid===selUid);if(s){s.fx=!s.fx;render();}}

function moveSel(d){const i=S.stems.findIndex(st=>st.uid===selUid);if(i<0)return;const ni=i+d;if(ni<0||ni>=S.stems.length)return;[S.stems[i],S.stems[ni]]=[S.stems[ni],S.stems[i]];render();}

function dupSel(){const s=S.stems.find(st=>st.uid===selUid);if(!s)return;const uid='f'+Date.now();S.stems.push({...s,uid,x:s.x+22,y:s.y+10,r:s.r+8});selUid=uid;render();}

function delSel(){if(!selUid)return;S.stems=S.stems.filter(st=>st.uid!==selUid);selUid=S.stems.length?S.stems[S.stems.length-1].uid:null;render();}

function clearCanvas(){S.stems=[];selUid=null;render();toast('Canvas cleared!');}

function autoArrange(){if(!S.stems.length){loadDefault();return;}const n=S.stems.length;S.stems.forEach((s,i)=>{const prog=n===1?.5:i/(n-1);const row=i%2;const sw=Math.min(200,n*22);const ox=(prog-.5)*sw;s.x=Math.round(300+ox);s.y=Math.round((row===0?255:308)+Math.abs(ox)*.18);s.r=Math.round(ox*.24);});render();toast('✨ Arranged!');}

function loadSample(){const ids=FLOWERS.map(f=>f.id);const count=8+Math.floor(Math.random()*5);S.stems=Array.from({length:count},(_,i)=>({uid:'s'+Date.now()+'_'+i,id:ids[Math.floor(Math.random()*ids.length)],x:300,y:270,r:0,sc:.95+Math.random()*.15,fx:Math.random()>.5}));autoArrange();}

function switchTab(name){['flowers','wrap','note'].forEach(t=>{const btn=document.getElementById('tb-'+t),panel=document.getElementById('tp-'+t);const a=t===name;btn.style.cssText=a?'flex:1;padding:7px 4px;border-radius:8px;font-size:11px;font-weight:600;background:white;color:#5c4b49;border:none;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.06);':'flex:1;padding:7px 4px;border-radius:8px;font-size:11px;font-weight:500;color:#8c7774;background:transparent;border:none;cursor:pointer;';panel.style.display=a?'block':'none';});}

function setWrapper(w){S.wrapper=w;document.querySelectorAll('.wrap-btn').forEach(b=>{const sel=b.getAttribute('data-wrap')===w;b.style.border=sel?'2px solid #e58c94':'2px solid #f2e5e2';b.style.background=sel?'#fff9f5':'white';});render();}

function setRibbon(r){S.ribbon=r;document.querySelectorAll('.ribbon-btn').forEach(b=>{const sel=b.getAttribute('data-ribbon')===r;b.style.border=sel?'2px solid #e58c94':'2px solid #f2e5e2';b.style.background=sel?'#fff9f5':'white';});render();}

function syncNote(){S.note.show=document.getElementById('showTag').checked;S.note.to=document.getElementById('noteTo').value;S.note.from=document.getElementById('noteFrom').value;S.note.dist=document.getElementById('noteDist').value;S.note.msg=document.getElementById('noteMsg').value;render();syncMsgPreview();}

function syncMsgPreview(){const el=document.getElementById('msgPreview');if(el)el.textContent=S.note.msg||'';}

function nextPrompt(){promptIdx=(promptIdx+1)%PROMPTS.length;document.getElementById('noteMsg').value=PROMPTS[promptIdx];syncNote();}
