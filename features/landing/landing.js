/* Home page: floating petals and the hero bouquet */

document.addEventListener('DOMContentLoaded',()=>{spawnLandingPetals();renderHero();});

function spawnLandingPetals(){
  const c=document.getElementById('landingPetals');
  if(!c)return;
  const emojis=['🌸','🌷','🌼','💮','🌺'];
  for(let i=0;i<14;i++){
    const d=document.createElement('div');
    d.className='bg-petal';
    d.textContent=emojis[i%emojis.length];
    const dur=12+Math.random()*12;
    // Negative delay starts each petal part-way through its drift, so some are on screen right away
    d.style.cssText=`left:${Math.random()*100}%;bottom:-40px;font-size:${16+Math.random()*18}px;animation-duration:${dur}s;animation-delay:${-Math.random()*dur}s;opacity:.55;`;
    c.appendChild(d);
  }
}

/* Landing hero: the default arrangement drawn with the builder's own flowers, blush wrap and rose ribbon, no gift tag */
function renderHero(){
  const saved={stems:S.stems,wrapper:S.wrapper,ribbon:S.ribbon,note:S.note};
  S.stems=defaultStems();S.wrapper='blush';S.ribbon='rose';S.note={...S.note,show:false};
  render('heroSvg',true);
  Object.assign(S,saved);
}
