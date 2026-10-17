/* Send screen: builds the link, opens the Gmail draft and copies the letter card to paste in */

function goToSend(){
  document.getElementById('senderName').value=S.note.from||'';
  syncMsgPreview();
  showScreen('send');
}

function backToForm(){
  document.getElementById('send-form-panel').style.display='block';
  document.getElementById('send-confirm-panel').style.display='none';
  document.getElementById('sendBtn').disabled=false;
}

/* The address the recipient's link should point at, or '' if there is none that would work for them */
function shareBase(){
  if(APP_URL)return APP_URL.split('#')[0];
  if(/^(https?|file):$/.test(location.protocol))return location.href.split('#')[0];
  return '';
}

function sendLetter(){
  const email = document.getElementById('recipientEmail').value.trim();
  const senderN = document.getElementById('senderName').value.trim();
  const warn = document.getElementById('sendWarn');
  warn.style.display='none';
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ toast('Please enter a valid email address.'); return; }
  const base = shareBase();
  if(!base){
    warn.textContent="This page is open inside a preview window, so it can't make a link that will open for them. Open it from where it's hosted (or set APP_URL at the top of the script), then send.";
    warn.style.display='block';
    return;
  }
  if(senderN){ S.note.from = senderN; document.getElementById('noteFrom').value = senderN; }

  bouquetLink = `${base}#b=${encodeBouquet()}`;
  _lastEmail = email;

  // Copy the styled letter card first, while the click still counts as a user action
  const copying = copyLetter();

  // Gmail draft with recipient and subject; the body is pasted in by the sender
  const subject = `🌷 ${S.note.from||'Someone'} sent you a bouquet across the miles`;
  _lastGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;
  window.open(_lastGmailUrl, '_blank');

  document.getElementById('previewRecipient').textContent = email;
  const lw = document.getElementById('linkWarn');
  if(!APP_URL && location.protocol==='file:'){
    lw.textContent="Heads up: this page is open from a file on your computer, so the bouquet link will only work on this computer. Host the page before sending it for real.";
    lw.style.display='block';
  } else lw.style.display='none';
  setCopyStatus(null);
  document.getElementById('send-form-panel').style.display = 'none';
  document.getElementById('send-confirm-panel').style.display = 'flex';
  copying.then(setCopyStatus);
}

let _lastGmailUrl = '', _lastEmail = '';
function reopenGmail(){ if(_lastGmailUrl) window.open(_lastGmailUrl,'_blank'); }

function previewAsRecipient(){ if(bouquetLink) window.open(bouquetLink,'_blank'); }

function copyLetterAgain(){ setCopyStatus(null); copyLetter().then(setCopyStatus); }

function setCopyStatus(ok){
  const el=document.getElementById('copyStatus');
  if(ok===null){el.textContent='Copying your letter…';el.style.background='#f7f4f3';el.style.color='#8c7774';return;}
  el.textContent=ok?'✓ Your letter card is copied and ready to paste':"Couldn't copy automatically. Tap \"Copy letter again\", then paste.";
  el.style.background=ok?'#eef6e9':'#fff0f1';
  el.style.color=ok?'#5d8a4c':'#c25763';
}

/* Puts the letter card on the clipboard as rich HTML (with a plain-text twin). Resolves true/false. */
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
function buildEmailHTML(link){
  const to=esc(S.note.to||'you'), from=esc(S.note.from||'Someone special'), dist=esc(S.note.dist||''), href=esc(link);
  const sans="Arial,Helvetica,sans-serif", serif="Georgia,'Times New Roman',serif";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff0f4;border-radius:20px;border-collapse:separate;">
<tr><td align="center" style="padding:28px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background-color:#ffffff;border:2px solid #f5d8dc;border-radius:20px;border-collapse:separate;">
<tr><td align="center" style="padding:28px 28px 0;font-size:44px;line-height:1;">🌷</td></tr>
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
