/* Draws a bouquet from state S: flowers, wrapper, ribbon, gift tag and the builder's handles.
   Used by the builder canvas, the landing hero and the recipient's reveal. */

function render(svgId='mainSvg',preview=false){
  const svg=document.getElementById(svgId);if(!svg)return;
  if(preview){
    // Filter IDs get a per-SVG suffix: url(#softShadow) would otherwise point at the copy inside the hidden builder SVG and the wrapper/tag would not paint
    const markup=`${document.querySelector('#mainSvg defs').outerHTML}<g>${wrapBack()}</g><g>${flowersMarkup(true)}</g><g>${wrapFront()}</g><g>${ribbonMarkup()}</g><g>${tagMarkup(true)}</g>`;
    svg.innerHTML=markup.replace(/\b(softShadow|uiShadow)\b/g,`$1_${svgId}`);
    return;
  }
  document.getElementById('wrapBack').innerHTML=wrapBack();
  document.getElementById('flowersLayer').innerHTML=flowersMarkup(false);
  document.getElementById('wrapFront').innerHTML=wrapFront();
  document.getElementById('ribbonLayer').innerHTML=ribbonMarkup();
  document.getElementById('tagLayer').innerHTML=tagMarkup();
  document.getElementById('gizmoLayer').innerHTML=gizmoMarkup();
  document.getElementById('stemBadge').textContent=`${S.stems.length} stem${S.stems.length!==1?'s':''}`;
  updatePill();
}

function flowersMarkup(preview){
  return S.stems.map(s=>{
    const def=FLOWERS.find(f=>f.id===s.id);if(!def)return'';
    const sx=s.fx?-s.sc:s.sc;
    return `<g class="flower-entity" data-uid="${s.uid}" transform="translate(${s.x},${s.y}) rotate(${s.r}) scale(${sx},${s.sc})">${def.svg}</g>`;
  }).join('');
}

function gizmoMarkup(){
  if(!selUid)return'';
  const s=S.stems.find(st=>st.uid===selUid);if(!s)return'';
  const hw=72*s.sc,topH=135*s.sc,botH=28*s.sc,rotLen=32,rotY=-topH-rotLen;
  const pillX=Math.max(110,Math.min(490,s.x));
  const pillY=(s.y+topH+46>680)?s.y-topH-46:s.y+botH+46;
  return `<g style="user-select:none">
    <g transform="translate(${s.x},${s.y}) rotate(${s.r})">
      <rect data-gizmo="move" x="${-hw}" y="${-topH}" width="${hw*2}" height="${topH+botH}" rx="12" fill="rgba(255,240,242,.04)" stroke="#E58C94" stroke-width="2" stroke-dasharray="6,4" class="gizmo-move" style="cursor:move"/>
      <line x1="0" y1="${-topH}" x2="0" y2="${rotY}" stroke="#E58C94" stroke-width="2"/>
      <g data-gizmo="rotate" transform="translate(0,${rotY})" class="gizmo-rotate" filter="url(#uiShadow)">
        <circle cx="0" cy="0" r="15" fill="#FFF" stroke="#E58C94" stroke-width="2.2"/>
        <path d="M-5-2 A5.5 5.5 0 1 1-1 5.5 M-5-6 L-5.5-1.5 L-1-2" fill="none" stroke="#D46A74" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      ${[[-hw,-topH],[hw,-topH],[-hw,botH],[hw,botH]].map(([cx,cy])=>`<g data-gizmo="scale" transform="translate(${cx},${cy})" class="gizmo-scale" filter="url(#uiShadow)"><circle cx="0" cy="0" r="13" fill="transparent"/><circle cx="0" cy="0" r="7" fill="#FFF" stroke="#E58C94" stroke-width="2.2"/></g>`).join('')}
    </g>
    ${feedback?`<g transform="translate(${s.x},${Math.max(32,s.y-topH-60)})" style="pointer-events:none" filter="url(#uiShadow)"><rect x="-36" y="-14" width="72" height="26" rx="13" fill="#5C4B49"/><text x="0" y="2" text-anchor="middle" fill="#FFFDF9" font-family="'Plus Jakarta Sans',sans-serif" font-size="11" font-weight="700">${feedback}</text></g>`:''}
    <g transform="translate(${pillX},${pillY})" filter="url(#uiShadow)">
      <rect x="-96" y="-18" width="192" height="36" rx="18" fill="#FFF" stroke="#F0D8D6" stroke-width="1.8"/>
      <g class="action-btn" onclick="flipSel()" transform="translate(-72,0)"><circle cx="0" cy="0" r="14" fill="#FFFDF9"/><path d="M-6 0 L6 0 M-3-3.5 L-6.5 0 L-3 3.5 M3-3.5 L6.5 0 L3 3.5" fill="none" stroke="#5C4B49" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="action-btn" onclick="moveSel(1)" transform="translate(-36,0)"><circle cx="0" cy="0" r="14" fill="#FFFDF9"/><path d="M0 5 L0-5 M-4-1 L0-5.5 L4-1" fill="none" stroke="#5C4B49" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="action-btn" onclick="moveSel(-1)" transform="translate(0,0)"><circle cx="0" cy="0" r="14" fill="#FFFDF9"/><path d="M0-5 L0 5 M-4 1 L0 5.5 L4 1" fill="none" stroke="#5C4B49" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="action-btn" onclick="dupSel()" transform="translate(36,0)"><circle cx="0" cy="0" r="14" fill="#FFFDF9"/><rect x="-4.5" y="-4.5" width="7" height="7" rx="1.5" fill="none" stroke="#5C4B49" stroke-width="1.5"/><path d="M-1 2.5 L-1 5 C-1 5.5-0.5 6 0 6 L4.5 6 C5 6 5.5 5.5 5.5 5 L5.5 0.5 C5.5 0 5-0.5 4.5-0.5 L2.5-0.5" fill="none" stroke="#5C4B49" stroke-width="1.5" stroke-linecap="round"/></g>
      <g class="action-btn" onclick="delSel()" transform="translate(72,0)"><circle cx="0" cy="0" r="14" fill="#FFF0F1"/><path d="M-4-4 L4 4 M4-4 L-4 4" fill="none" stroke="#D46A74" stroke-width="1.8" stroke-linecap="round"/></g>
    </g>
  </g>`;
}

function wrapColors(st){return{kraft:{back:'#DEC0A1',fl:'#EBD3B9',fr:'#E3C7A9',str:'#B89673',tissue:'#FFFDF9'},blush:{back:'#F5C6CD',fl:'#FADCE0',fr:'#F7CFD5',str:'#D99BA3',tissue:'#FFFDF9'},lavender:{back:'#C9D0F0',fl:'#E1E6FC',fr:'#D6DCF7',str:'#9EA7CC',tissue:'#FFFDF9'},sage:{back:'#C5D8B5',fl:'#DFECD3',fr:'#D2E3C4',str:'#93AD7E',tissue:'#FFFDF9'}}[st]||null;}
function wrapBack(){if(S.wrapper==='none')return'';if(S.wrapper==='vase')return`<ellipse cx="300" cy="430" rx="68" ry="16" fill="#E4F3F7" fill-opacity="0.5" stroke="#9BC0CC" stroke-width="2.5"/>`;const c=wrapColors(S.wrapper);return`<g filter="url(#softShadow)"><path d="M300 590 L95 265 Q195 185 300 225 Q405 185 505 265 Z" fill="${c.back}" stroke="${c.str}" stroke-width="2.5" stroke-linejoin="round"/><path d="M300 560 L125 275 Q175 230 230 252 Q265 215 300 245 Q335 215 370 252 Q425 230 475 275 Z" fill="${c.tissue}" fill-opacity="0.92" stroke="#E8DCD8" stroke-width="1.8"/></g>`;}
function wrapFront(){if(S.wrapper==='none')return'';if(S.wrapper==='vase')return`<g filter="url(#softShadow)"><path d="M232 430 C232 465 205 500 208 580 C210 630 245 653 300 653 C355 653 390 630 392 580 C395 500 368 465 368 430 Z" fill="#DDF1F7" fill-opacity="0.58" stroke="#99C1CE" stroke-width="3"/><path d="M212 520 Q300 533 388 520 L391 580 C389 627 354 649 300 649 C246 649 211 627 209 580 Z" fill="#BBE3F0" fill-opacity="0.45"/><ellipse cx="300" cy="520" rx="88" ry="10" fill="#E8F8FC" fill-opacity="0.6" stroke="#A5CEDB" stroke-width="1.5"/></g>`;const c=wrapColors(S.wrapper);return`<g filter="url(#softShadow)" stroke-linejoin="round"><path d="M268 540 L238 657 Q300 675 362 657 L332 540 Z" fill="${c.back}" stroke="${c.str}" stroke-width="2.5"/><path d="M115 295 L300 490 L335 555 L262 555 Z" fill="${c.fl}" stroke="${c.str}" stroke-width="2.5"/><path d="M485 295 L300 490 L262 555 L338 555 Z" fill="${c.fr}" stroke="${c.str}" stroke-width="2.5"/></g>`;}
function ribbonMarkup(){if(S.ribbon==='none')return'';const p={rose:{f:'#F49EA7',d:'#DC7F89',s:'#BD626C'},cream:{f:'#FFF6DE',d:'#F2E1B8',s:'#C9B17E'},blue:{f:'#BFCBF5',d:'#A3B2E6',s:'#7D8CC2'},berry:{f:'#D96B78',d:'#BF505D',s:'#943540'},twine:{f:'#CFAF8A',d:'#B8956E',s:'#8F6D48'}}[S.ribbon]||{f:'#F49EA7',d:'#DC7F89',s:'#BD626C'};const y=S.wrapper==='vase'?450:543;return`<g transform="translate(300,${y})" stroke="${p.s}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="-42" y="-10" width="84" height="20" rx="8" fill="${p.d}"/><path d="M-8 6 Q-32 58-52 105 L-30 98 L-22 114 Q-8 62 2 10 Z" fill="${p.d}"/><path d="M8 6 Q32 58 52 105 L30 98 L22 114 Q8 62-2 10 Z" fill="${p.f}"/><path d="M-6 0 C-45-38-82-18-72 12 C-62 36-25 22-6 4 Z" fill="${p.f}"/><path d="M6 0 C45-38 82-18 72 12 C62 36 25 22 6 4 Z" fill="${p.f}"/><rect x="-12" y="-12" width="24" height="24" rx="8" fill="${p.f}"/></g>`;}
function tagMarkup(forRecipient=false){if(!S.note.show)return'';const y=S.wrapper==='vase'?460:550;const to=esc(S.note.to||'You'),dist=esc(S.note.dist||'');return`<g transform="translate(345,${y})" filter="url(#softShadow)"><path d="M-35-5 Q-10 8 12 22" fill="none" stroke="#C6A27E" stroke-width="1.8" stroke-dasharray="3,2"/><g transform="translate(12,18) rotate(8)"><rect x="0" y="0" width="136" height="68" rx="10" fill="#FFFDF9" stroke="#E5C5C7" stroke-width="2"/><rect x="5" y="5" width="126" height="58" rx="7" fill="none" stroke="#FAD6D9" stroke-width="1" stroke-dasharray="4,3"/><circle cx="14" cy="14" r="4" fill="#F5E6E4" stroke="#D9B8B5" stroke-width="1.5"/><text x="26" y="24" font-family="'Caveat',cursive" font-size="18" font-weight="700" fill="#D46A74">For ${to}</text><text x="14" y="43" font-family="'Plus Jakarta Sans',sans-serif" font-size="9.5" font-weight="600" fill="#8C7774">${dist?'✈️ '+dist:'💌 With all my love'}</text><text x="14" y="57" font-family="'Plus Jakarta Sans',sans-serif" font-size="8" fill="#B59E9B">${forRecipient?'From '+esc(S.note.from||'someone special'):'Tap to edit note'}</text></g></g>`;}
