/* Canvas confetti for the envelope and reveal screens */

const CONFETTI_COLORS=['#FF6B6B','#FF8E53','#FFD93D','#6BCB77','#4D96FF','#845EC2','#FF9671','#F9F871','#00C9A7','#C34B4B','#FF6FC8','#00B4D8'];
const CONFETTI_SHAPES=['rect','rect','rect','diamond','circle','ribbon'];

/* canvasId: which canvas element to draw on */
function startConfettiOn(canvasId){
  const canvas=document.getElementById(canvasId);
  if(!canvas)return;
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
  const pieces=[];
  for(let i=0;i<130;i++){
    pieces.push({
      x:Math.random()*canvas.width,
      y:-Math.random()*canvas.height*.7,
      vx:(Math.random()-.5)*3.5,
      vy:2.2+Math.random()*3,
      rot:Math.random()*360,
      rotV:(Math.random()-.5)*9,
      w:8+Math.random()*14,
      h:6+Math.random()*10,
      color:CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)],
      shape:CONFETTI_SHAPES[Math.floor(Math.random()*CONFETTI_SHAPES.length)],
      alpha:1,
      ribbonT:Math.random()*Math.PI*2,
      ribbonS:2+Math.random()*3,
    });
  }
  let raf=null;
  function loop(){
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let alive=false;
    pieces.forEach(p=>{
      p.y+=p.vy; p.x+=p.vx; p.rot+=p.rotV; p.vx*=.992;
      if(p.y>canvas.height*.82) p.alpha-=.018;
      if(p.alpha<=0)return;
      alive=true;
      ctx.save();ctx.globalAlpha=Math.max(0,p.alpha);ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color;
      if(p.shape==='rect'){ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);}
      else if(p.shape==='diamond'){ctx.beginPath();ctx.moveTo(0,-p.h/2);ctx.lineTo(p.w/2,0);ctx.lineTo(0,p.h/2);ctx.lineTo(-p.w/2,0);ctx.closePath();ctx.fill();}
      else if(p.shape==='circle'){ctx.beginPath();ctx.arc(0,0,p.h/2,0,Math.PI*2);ctx.fill();}
      else if(p.shape==='ribbon'){
        ctx.strokeStyle=p.color;ctx.lineWidth=2.5;ctx.lineCap='round';
        ctx.beginPath();
        for(let t=0;t<=1;t+=.05){const rx=Math.sin(p.ribbonT+t*Math.PI*2)*p.ribbonS*4,ry=t*p.h*3;t===0?ctx.moveTo(rx,ry):ctx.lineTo(rx,ry);}
        ctx.stroke();
      }
      ctx.restore();
    });
    if(alive) raf=requestAnimationFrame(loop);
    else{ ctx.clearRect(0,0,canvas.width,canvas.height); }
  }
  raf=requestAnimationFrame(loop);
  setTimeout(()=>{ pieces.forEach(p=>{ p.vy+=.06; }); },5000);
}

/* Shorthand for the recipient-screen canvas */
function startConfetti(){ startConfettiOn('confetti-canvas'); }
