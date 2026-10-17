/* Recipient experience: envelope, love letter modal, bouquet reveal */

function openEnvelope(){
  if(envelopeOpened)return;
  envelopeOpened=true;
  const env=document.getElementById('envContainer');
  env.classList.remove('env-bounce');
  env.classList.add('stop');
  document.getElementById('clickHint').style.display='none';
  // 1. Open flap
  document.getElementById('envFlap').classList.add('open');
  // 2. Rise letter after 0.5s
  setTimeout(()=>{document.getElementById('letterCard').classList.add('risen');},500);
  // 3. Start confetti
  setTimeout(()=>{startConfetti();},400);
  // 4. Show letter modal after 2s
  setTimeout(()=>{showLetterModal();},2200);
}

function showLetterModal(){
  document.getElementById('modal-to').textContent=S.note.to||'My Love';
  document.getElementById('modal-from').textContent=S.note.from||'Yours Always';
  document.getElementById('modal-msg').textContent=S.note.msg||'';
  const dist=S.note.dist?.trim();
  if(dist){document.getElementById('modal-dist-badge').style.display='inline-flex';document.getElementById('modal-dist').textContent=dist;}
  else{document.getElementById('modal-dist-badge').style.display='none';}
  document.getElementById('letter-modal').classList.add('open');
}

function closeModal(){document.getElementById('letter-modal').classList.remove('open');}

function openBouquet(){
  closeModal();
  showScreen('bouquet');

  // Update heading with recipient name
  document.getElementById('bouquetRevealTitle').textContent=`Your bouquet is here, ${S.note.to||'you'}! 🌷`;
  document.getElementById('bouquetRevealSub').textContent=`Hand-picked by ${S.note.from||'someone who loves you'}, just for you`;

  // Render bouquet into reveal SVG (preview mode: defs copied, recipient tag text, no gizmos)
  render('revealSvg',true);

  // Build floriography
  const ids=[...new Set(S.stems.map(s=>s.id))];
  document.getElementById('revealFloriography').innerHTML=ids.map(id=>{
    const def=FLOWERS.find(f=>f.id===id);
    return def?`<div style="padding:5px 10px;border-radius:10px;background:#fff7f8;border:1px solid #f5d8dc;font-size:11px;color:#5c4b49;"><span style="font-weight:600;color:#d46a74;">${def.name}:</span> ${def.meaning}</div>`:'';
  }).join('');

  // Confetti on the bouquet screen canvas
  startConfettiOn('confetti-canvas2');
}

function showRecipient(){
  showScreen('recipient');
  const from=S.note.from&&S.note.from.trim();
  document.getElementById('recipientHeading').textContent=from?`${from} sent you a bouquet`:'A bouquet is waiting for you';
  resetEnvelope();
}

/* Puts the envelope back to its closed, bouncing state so it can be opened again */
function resetEnvelope(){
  envelopeOpened=false;
  const env=document.getElementById('envContainer');
  env.classList.remove('stop');env.classList.add('env-bounce');
  document.getElementById('envFlap').classList.remove('open');
  document.getElementById('letterCard').classList.remove('risen');
  document.getElementById('clickHint').style.display='';
}
