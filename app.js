/* App start-up, plus resetAll(), the one action that touches several features.
   Loaded last, after every feature. */

document.addEventListener('DOMContentLoaded',()=>{buildGrid();setupEvents();spawnLandingPetals();renderHero();if(loadFromHash()){showRecipient();}else{syncNote();loadDefault();}syncMsgPreview();});

function resetAll(){
  document.getElementById('send-form-panel').style.display='block';
  document.getElementById('send-confirm-panel').style.display='none';
  // Drop any bouquet received via link so the new one starts from the builder's own defaults
  if(/^#(b|bouquet)=/.test(location.hash)) history.replaceState(null,'',location.href.split('#')[0]);
  S.note={show:document.getElementById('showTag').checked,to:document.getElementById('noteTo').value,from:document.getElementById('noteFrom').value,dist:document.getElementById('noteDist').value,msg:document.getElementById('noteMsg').value};
  setWrapper('kraft');setRibbon('rose');
  S.stems=[];selUid=null;
  closeModal();resetEnvelope();
  loadDefault();
  goToLanding();
}
