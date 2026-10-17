/* Helpers for every feature: esc() for safe HTML, toast() for short messages */

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
let toastTimer=null;
function toast(msg,dur=3000){const el=document.getElementById('toast');document.getElementById('toastMsg').textContent=msg;el.classList.add('show');if(toastTimer)clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),dur);}
