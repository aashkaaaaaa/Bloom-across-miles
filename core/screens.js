/* Screen switching. Every screen in index.html is an element with
   data-screen="name" and data-display="flex" (or "block").
   Add a screen by adding such an element; nothing here needs to change. */

function showScreen(name){
  let found=false;
  document.querySelectorAll('[data-screen]').forEach(el=>{
    const on=el.dataset.screen===name;
    if(on)found=true;
    el.style.display=on?(el.dataset.display||'block'):'none';
  });
  if(!found)console.warn('showScreen: no screen named "'+name+'"');
  window.scrollTo(0,0);
}
