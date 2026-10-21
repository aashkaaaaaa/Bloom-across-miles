/* Bouquet link format: the part after # in the link sent to the recipient.
   Newest: #z=... (compressed, about a third shorter). Still opens #b=... and the original #bouquet=... */

function bouquetPayload(){
  return {v:2,w:S.wrapper,r:S.ribbon,n:[S.note.show?1:0,S.note.to||'',S.note.from||'',S.note.dist||'',S.note.msg||''],
    s:S.stems.map(s=>[FLOWERS.findIndex(f=>f.id===s.id),Math.round(s.x),Math.round(s.y),Math.round(s.r),Math.round(s.sc*100),s.fx?1:0])};
}
function toB64url(bytes){let bin='';bytes.forEach(b=>{bin+=String.fromCharCode(b);});return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function fromB64url(str){let b64=decodeURIComponent(str).replace(/-/g,'+').replace(/_/g,'/');while(b64.length%4)b64+='=';return Uint8Array.from(atob(b64),c=>c.charCodeAt(0));}
async function pipeBytes(bytes,stream){return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());}

/* Uncompressed form (#b=), kept for browsers without compression support */
function encodeBouquet(){return toB64url(new TextEncoder().encode(JSON.stringify(bouquetPayload())));}

/* What goes after # in the link: compressed when the browser can, otherwise the plain form */
async function makeBouquetHash(){
  const raw=new TextEncoder().encode(JSON.stringify(bouquetPayload()));
  if(typeof CompressionStream==='function'){
    try{return 'z='+toB64url(await pipeBytes(raw,new CompressionStream('deflate-raw')));}catch(e){}
  }
  return 'b='+toB64url(raw);
}

/* Reads the link into S. Resolves true only if a usable bouquet was found. */
async function loadFromHash(){
  const hash=location.hash||'';
  const isZip=hash.startsWith('#z='), isNew=isZip||hash.startsWith('#b='), isOld=hash.startsWith('#bouquet=');
  if(!isNew&&!isOld)return false;
  try{
    let note,stems;
    if(isNew){
      let bytes=fromB64url(hash.slice(3));
      if(isZip){
        if(typeof DecompressionStream!=='function'){toast('This browser is too old to open the bouquet. Try an up-to-date Chrome, Safari or Firefox.',6000);return false;}
        bytes=await pipeBytes(bytes,new DecompressionStream('deflate-raw'));
      }
      const d=JSON.parse(new TextDecoder().decode(bytes));
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
