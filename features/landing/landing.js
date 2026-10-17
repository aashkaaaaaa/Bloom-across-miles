/* Landing page: floating petals, hero bouquet, scroll to 'How it works' */

function goToLanding(){showScreen('landing');}

function spawnLandingPetals(){
  const c=document.getElementById('landingPetals');
  if(!c)return;
  const emojis=['🌸','🌷','🌼','💮','🌺'];
  for(let i=0;i<14;i++){
    const d=document.createElement('div');
    d.className='bg-petal';
    d.textContent=emojis[i%emojis.length];
    d.style.cssText=`left:${Math.random()*100}%;bottom:-40px;font-size:${16+Math.random()*18}px;animation-duration:${10+Math.random()*12}s;animation-delay:${Math.random()*8}s;opacity:.35;`;
    c.appendChild(d);
  }
}

function scrollToFeatures(){
  document.getElementById('features').scrollIntoView({behavior:'smooth'});
}

/* Landing hero: the default arrangement drawn with the builder's own flowers, blush wrap and rose ribbon, no gift tag */
function renderHero(){
  const saved={stems:S.stems,wrapper:S.wrapper,ribbon:S.ribbon,note:S.note};
  S.stems=defaultStems();S.wrapper='blush';S.ribbon='rose';S.note={...S.note,show:false};
  render('heroSvg',true);
  Object.assign(S,saved);
}
