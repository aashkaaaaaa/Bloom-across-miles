/* Bouquet link format: the part after # in the link sent to the recipient.
   Current format is #b=... (v2). Old #bouquet=... links still open. */

/* Compact, URL-safe bouquet payload: flower index instead of id, scale as a whole number, no double encoding */
function encodeBouquet(){
  const d={v:2,w:S.wrapper,r:S.ribbon,n:[S.note.show?1:0,S.note.to||'',S.note.from||'',S.note.dist||'',S.note.msg||''],
    s:S.stems.map(s=>[FLOWERS.findIndex(f=>f.id===s.id),Math.round(s.x),Math.round(s.y),Math.round(s.r),Math.round(s.sc*100),s.fx?1:0])};
  const bytes=new TextEncoder().encode(JSON.stringify(d));
  let bin='';bytes.forEach(b=>{bin+=String.fromCharCode(b);});
  return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

/* Reads #bouquet=... into S. Returns true only if a usable bouquet was found. */
function loadFromHash(){
  const hash=location.hash||'';
  const isNew=hash.startsWith('#b='), isOld=hash.startsWith('#bouquet=');
  if(!isNew&&!isOld)return false;
  try{
    let note,stems;
    if(isNew){
      let b64=decodeURIComponent(hash.slice(3)).replace(/-/g,'+').replace(/_/g,'/');
      while(b64.length%4)b64+='=';
      const bin=atob(b64);
      const d=JSON.parse(new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0))));
      const n=Array.isArray(d.n)?d.n:[];
      S.wrapper=d.w||'kraft';S.ribbon=d.r||'rose';
      note={show:n[0]!==0,to:n[1],from:n[2],dist:n[3],msg:n[4]};
      stems=(Array.isArray(d.s)?d.s:[]).map(a=>Array.isArray(a)&&FLOWERS[a[0]]?[FLOWERS[a[0]].id,a[1],a[2],a[3],(+a[4]||100)/100,a[5]]:null).filter(Boolean);
    }else{
      const d=JSON.parse(decodeURIComponent(atob(decodeURIComponent(hash.slice(9)))));
      const n=d.n||{};
      S.wrapper=d.w||'kraft';S.ribbon=d.r||'rose';
      note={show:n.show!==false,to:n.to,from:n.from,dist:n.dist,msg:n.msg};
      stems=(Array.isArray(d.s)?d.s:[]).filter(a=>Array.isArray(a)&&FLOWERS.some(f=>f.id===a[0]));
    }
    S.note={show:note.show,to:String(note.to||''),from:String(note.from||''),dist:String(note.dist||''),msg:String(note.msg||'')};
    S.stems=stems.map((a,i)=>({uid:'sh'+i,id:a[0],x:+a[1]||300,y:+a[2]||270,r:+a[3]||0,sc:+a[4]||1,fx:!!a[5]}));
    selUid=null;
    render();
    return true;
  }catch(e){
    toast('This bouquet link looks incomplete. Ask the sender to send it again.',5000);
    return false;
  }
}
