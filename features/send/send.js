/* Send screen: builds the link, opens the Gmail draft and copies the letter card to paste in */

function goToSend(){
  // Leave the name empty while it's still the placeholder sign-off, so the subject never says "Yours Always sent you..."
  const from=(S.note.from||'').trim();
  document.getElementById('senderName').value=(from&&from!=='Yours Always')?from:'';
  showSendPanel('send-form-panel');
  prepareLink();
  syncMsgPreview();
  showScreen('send');
}

function backToForm(){
  showSendPanel('send-form-panel');
  document.getElementById('sendBtn').disabled=false;
}

/* The recipient page the link should open (bouquet.html next to this page), or '' if no link would work for them */
function shareBase(){
  if(APP_URL)return new URL('bouquet.html',APP_URL.replace(/\/?$/,'/')).href;
  if(/^(https?|file):$/.test(location.protocol))return new URL('bouquet.html',location.href).href;
  return '';
}

/* "Send another": forget this bouquet and open a fresh builder */
function startFresh(){
  if(typeof clearDraft==='function')clearDraft();
  location.href='create.html';
}

const EMAILJS_ON = !!(EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId);

/* Send: check the details, build the link, then email it (EmailJS) or copy the card and open a Gmail draft */
async function sendLetter(){
  const email = document.getElementById('recipientEmail').value.trim();
  const senderN = document.getElementById('senderName').value.trim();
  const warn = document.getElementById('sendWarn');
  warn.style.display='none';
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ toast('Please enter a valid email address.'); return; }
  if(!senderN){ toast('Add your name so they know who it\'s from.'); document.getElementById('senderName').focus(); return; }
  const base = shareBase();
  if(!base){
    warn.textContent="This page is open inside a preview window, so it can't make a link that will open for them. Open it from where it's hosted (or set APP_URL in core/config.js), then send.";
    warn.style.display='block';
    return;
  }
  S.note.from = senderN; document.getElementById('noteFrom').value = senderN;
  _lastEmail = email;

  if(EMAILJS_ON){ return sendWithEmailJS(base); }

  // Everything below runs straight away inside the click (no waiting), so Gmail opens directly
  // and the pink card copy is allowed. The short link was prepared while this screen was open.
  bouquetLink = `${base}#${readyHash()}`;
  const copying = copyLetter();
  prepareGmail();
  const tab = window.open(_lastGmailUrl, '_blank');
  document.getElementById('popupBlocked').style.display = tab ? 'none' : 'block';
  fillConfirm();
  setCopyStatus(null);
  showSendPanel('send-confirm-panel');
  copying.then(setCopyStatus);
}

/* Short (compressed) link, prepared ahead of the click. If it isn't ready, or this browser can't
   compress, the plain #b= link is used, which every version of the bouquet page opens. */
let _prepared={key:'',hash:''};
function payloadKey(){ return JSON.stringify(bouquetPayload()); }
async function prepareLink(){
  if(typeof makeBouquetHash!=='function')return;
  const key=payloadKey();
  if(_prepared.key===key)return;
  try{ const hash=await makeBouquetHash(); if(payloadKey()===key)_prepared={key,hash}; }catch(e){}
}
function readyHash(){
  return (_prepared.key===payloadKey() && _prepared.hash) ? _prepared.hash : 'b='+encodeBouquet();
}

function prepareGmail(){
  const subject = `🌷 ${S.note.from} sent you a bouquet across the miles`;
  // Empty body on purpose: the pink card is already on the clipboard, so one Ctrl+V fills it
  _lastGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(_lastEmail)}&su=${encodeURIComponent(subject)}`;
}

function fillConfirm(){
  document.getElementById('previewRecipient').textContent = _lastEmail;
  document.getElementById('cardPreview').innerHTML = buildEmailHTML(bouquetLink);
  document.querySelectorAll('#screen-send kbd.mod').forEach(k=>{ k.textContent = MOD_KEY; });
  document.getElementById('copyStatus').textContent = '';
  const lw = document.getElementById('linkWarn');
  if(!APP_URL && location.protocol==='file:'){
    lw.textContent="Heads up: this page is open from a file on your computer, so the bouquet link will only work on this computer. Host the page before sending it for real.";
    lw.style.display='block';
  } else lw.style.display='none';
}

/* EmailJS: the card lives in the EmailJS template (setup/emailjs-template.html);
   only short, escaped values are sent, and the button always points at this site's bouquet page. */
async function sendWithEmailJS(base){
  const btn=document.getElementById('sendBtn');
  btn.disabled=true; const label=btn.textContent; btn.textContent='Sending…';
  const hash=readyHash();
  bouquetLink=`${base}#${hash}`;
  try{
    const res=await fetch('https://api.emailjs.com/api/v1.0/email/send',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({service_id:EMAILJS.serviceId, template_id:EMAILJS.templateId, user_id:EMAILJS.publicKey,
        template_params:{to_email:_lastEmail, to_name:S.note.to||'you', from_name:S.note.from, distance:S.note.dist||'across the miles', bouquet:hash}})
    });
    if(!res.ok) throw new Error(await res.text());
    document.getElementById('doneRecipient').textContent=_lastEmail;
    showSendPanel('send-done-panel');
    if(typeof clearDraft==='function')clearDraft();
  }catch(e){
    const w=document.getElementById('sendWarn');
    w.innerHTML='Couldn\'t send right now. <button type="button" onclick="sendViaGmailInstead()" style="background:none;border:none;color:#c25763;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer;padding:0;">Send with Gmail instead</button>';
    w.style.display='block';
  }finally{ btn.disabled=false; btn.textContent=label; }
}

/* Fallback after an EmailJS error: bouquetLink is already built, so Gmail opens inside this click */
function sendViaGmailInstead(){
  const copying = copyLetter();
  prepareGmail();
  const tab=window.open(_lastGmailUrl,'_blank');
  document.getElementById('popupBlocked').style.display = tab ? 'none' : 'block';
  document.getElementById('sendWarn').style.display='none';
  fillConfirm();
  setCopyStatus(null);
  showSendPanel('send-confirm-panel');
  copying.then(setCopyStatus);
}

/* Shows one of the send screen's panels */
function showSendPanel(id){
  ['send-form-panel','send-confirm-panel','send-done-panel'].forEach(p=>{
    const el=document.getElementById(p); if(!el)return;
    el.style.display = p===id ? (p==='send-confirm-panel'?'flex':'block') : 'none';
  });
  window.scrollTo(0,0);
}

/* "Ctrl" on Windows/Linux/Android, "Cmd" on Mac and iPhone/iPad */
const MOD_KEY = /Mac|iPhone|iPad|iPod/.test(navigator.platform||navigator.userAgent||'') ? 'Cmd' : 'Ctrl';

let _lastGmailUrl = '', _lastEmail = '';
function reopenGmail(){ if(_lastGmailUrl){ window.open(_lastGmailUrl,'_blank'); document.getElementById('popupBlocked').style.display='none'; } }

function previewAsRecipient(){ if(bouquetLink) window.open(bouquetLink,'_blank'); }

function copyLetterAgain(){ setCopyStatus(null); copyLetter().then(setCopyStatus); }

function setCopyStatus(ok){
  const el=document.getElementById('copyStatus');
  if(ok===null){el.textContent='Copying your pink card…';el.style.background='#f7f4f3';el.style.color='#8c7774';return;}
  el.textContent=ok?'✓ Your letter card is copied and ready to paste':"Couldn't copy automatically. Press Copy letter again, then paste.";
  el.style.background=ok?'#eef6e9':'#fff0f1';
  el.style.color=ok?'#5d8a4c':'#c25763';
}

/* Puts the letter card on the clipboard as rich HTML (with a plain-text twin). Resolves true/false. */
/* Copies the card for a link that may still be on its way. Starting the copy inside the click matters:
   browsers only allow clipboard writes during a click, and building the short link takes a moment. */
function copyLetterFor(linkPromise){
  try{
    if(navigator.clipboard && window.ClipboardItem){
      return navigator.clipboard.write([new ClipboardItem({
        'text/html':linkPromise.then(l=>new Blob([buildEmailHTML(l)],{type:'text/html'})),
        'text/plain':linkPromise.then(l=>new Blob([buildEmailText(l)],{type:'text/plain'}))
      })]).then(()=>true).catch(()=>linkPromise.then(l=>legacyCopy(buildEmailHTML(l))));
    }
  }catch(e){}
  return linkPromise.then(l=>legacyCopy(buildEmailHTML(l)));
}

function copyLetter(){
  const html=buildEmailHTML(bouquetLink), text=buildEmailText(bouquetLink);
  try{
    if(navigator.clipboard && window.ClipboardItem){
      return navigator.clipboard.write([new ClipboardItem({
        'text/html':new Blob([html],{type:'text/html'}),
        'text/plain':new Blob([text],{type:'text/plain'})
      })]).then(()=>true).catch(()=>legacyCopy(html));
    }
  }catch(e){}
  return Promise.resolve(legacyCopy(html));
}

function legacyCopy(html){
  const box=document.createElement('div');
  box.contentEditable='true';box.innerHTML=html;
  box.style.cssText='position:fixed;left:-9999px;top:0;opacity:0;';
  document.body.appendChild(box);
  const range=document.createRange();range.selectNodeContents(box);
  const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
  let ok=false;try{ok=document.execCommand('copy');}catch(e){}
  sel.removeAllRanges();box.remove();
  return ok;
}

function buildEmailText(link){
  const to=S.note.to||'you', from=S.note.from||'Someone special';
  return `💌 You have a special delivery, ${to}!

${from} hand-picked a bouquet of flowers just for you and sealed a love letter inside it.${S.note.dist?'\n\n✈️ '+S.note.dist:''}

Open your bouquet: ${link}

With all my love,
${from}`;
}

/* Email-safe letter card: tables, inline styles, solid colours and system fonts, since Gmail drops <style>, web fonts and gradients.
   The love letter itself is not included: it stays sealed in the envelope until they open the bouquet. */
/* Email card. Values are escaped here; setup/build-emailjs-template.js reuses this with {{placeholders}} for EmailJS.
   The confetti is an animated GIF because email apps don't run CSS or JavaScript animation. */
function buildEmailHTML(link, opts={}){
  const to=opts.to??esc(S.note.to||'you'), from=opts.from??esc(S.note.from||'Someone special'), dist=opts.dist??esc(S.note.dist||''), href=opts.href??esc(link);
  const gif=opts.gif??esc(new URL('assets/email-confetti.gif',link).href);
  const sans="Arial,Helvetica,sans-serif", serif="Georgia,'Times New Roman',serif";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff0f4;border-radius:20px;border-collapse:separate;">
<tr><td align="center" style="padding:28px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background-color:#ffffff;border:2px solid #f5d8dc;border-radius:20px;border-collapse:separate;">
<tr><td style="padding:0;line-height:0;font-size:0;"><img src="${gif}" width="480" alt="" style="display:block;width:100%;max-width:480px;height:auto;border:0;border-radius:18px 18px 0 0;"></td></tr>
<tr><td align="center" style="padding:6px 28px 0;font-size:44px;line-height:1;">🌷</td></tr>
<tr><td align="center" style="padding:14px 28px 0;font-family:${serif};font-size:24px;line-height:1.35;color:#5c4b49;">You have a special delivery, <span style="color:#d4747d;font-style:italic;">${to}</span></td></tr>
${dist?`<tr><td align="center" style="padding:12px 28px 0;"><span style="display:inline-block;background-color:#fff0f1;border:1px solid #fad6d9;border-radius:99px;padding:5px 14px;font-family:${sans};font-size:12px;font-weight:bold;color:#d46a74;">✈️ ${dist}</span></td></tr>`:''}
<tr><td align="center" style="padding:18px 34px 0;font-family:${sans};font-size:15px;line-height:1.6;color:#8c7774;"><strong style="color:#5c4b49;">${from}</strong> hand-picked a bouquet of flowers just for you and sealed a love letter inside it.</td></tr>
<tr><td align="center" style="padding:26px 28px 10px;"><a href="${href}" target="_blank" style="display:inline-block;background-color:#e68594;color:#ffffff;text-decoration:none;border-radius:14px;padding:15px 34px;font-family:${sans};font-size:16px;font-weight:bold;">🌷 Open My Bouquet</a></td></tr>
<tr><td align="center" style="padding:0 28px 24px;font-family:${sans};font-size:12px;color:#b59e9b;">Open it, then tap the envelope ✨</td></tr>
<tr><td align="center" style="padding:16px 28px 24px;border-top:1px solid #f5ebe9;font-family:${serif};font-size:14px;color:#94807d;font-style:italic;">With all my love,<br><span style="font-size:21px;color:#d4747d;font-weight:bold;">${from}</span></td></tr>
</table>
<div style="padding-top:14px;font-family:${sans};font-size:11px;color:#c0a8a8;">Sent via Bloom Across Miles 🌷</div>
</td></tr></table>`;
}

/* The sender's name is part of the link, so keep the prepared link in step while it's typed */
document.addEventListener('DOMContentLoaded',()=>{
  const name=document.getElementById('senderName');
  if(!name)return;
  let t=null;
  name.addEventListener('input',()=>{
    const v=name.value.trim();
    if(v){ S.note.from=v; }
    clearTimeout(t); t=setTimeout(prepareLink,250);
  });
});
