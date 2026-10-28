import {on,state} from './state.js';

const canvas=document.querySelector('#rain');
const context=canvas?.getContext('2d');
const glyphs=['·','▪','+','✱','#'];
const peaks=[.14,.29,.43,.57,.72,.87];
let frameId=0,timerId=0,burst=0,level=state.rain(),live=false,visible=true;
const stop=()=>{clearTimeout(timerId);timerId=0;cancelAnimationFrame(frameId);frameId=0};
const schedule=()=>{if(!state.reduced()&&!document.hidden&&visible&&!timerId)timerId=setTimeout(()=>{timerId=0;frameId=requestAnimationFrame(draw)},33)};

function draw(now=0,force=false){
  if(!context||document.hidden||!visible)return;

  const width=canvas.clientWidth,height=canvas.clientHeight;
  if(level==='off'){
    context.clearRect(0,0,width,height);
    schedule();
    return;
  }
  const styles=getComputedStyle(document.documentElement);
  const colors=['--rain-1','--rain-2','--rain-3','--rain-peak'].map(name=>styles.getPropertyValue(name).trim());
  const fontSize=parseFloat(getComputedStyle(document.body).fontSize)||14;
  const lineHeight=parseFloat(getComputedStyle(document.body).lineHeight)||21;
  context.clearRect(0,0,width,height);
  context.font=`${fontSize}px "JetBrains Mono",ui-monospace,monospace`;
  context.textBaseline='top';
  const cellWidth=context.measureText('#').width;
  const columns=Math.floor(width/cellWidth);
  const rows=Math.max(1,Math.floor(height/lineHeight));
  const loud=level==='loud'?1.7:1;
  const pulse=live&&!state.reduced()?1+.18*(.5+.5*Math.sin(now/650)):1;
  const burstScale=1+burst*.45;
  const matrix=document.documentElement.classList.contains('matrix');
  const phase=state.reduced()?0:now/1100;

  for(let x=0;x<columns;x++){
    const position=x/Math.max(columns-1,1);
    const envelope=Math.max(...peaks.map(center=>Math.exp(-Math.pow((position-center)/.035,2))));
    const drift=.55+.45*(.5+.5*Math.sin(phase+x*.037));
    const heightCells=matrix?rows:envelope<.08?0:Math.min(rows,Math.round(rows*envelope*drift*loud*pulse*burstScale));
    if(!heightCells)continue;
    for(let y=0;y<heightCells;y++){
      const noise=Math.sin(x*12.9898+y*78.233+Math.floor(phase*1.6)*.31)*43758.5453;
      const variation=noise-Math.floor(noise);
      if(variation<.17)continue;
      const levelIndex=Math.min(3,Math.floor((heightCells-y)/Math.max(heightCells,1)*4));
      const density=Math.min(glyphs.length-1,Math.floor(variation*glyphs.length));
      context.fillStyle=matrix?'#33ff66':colors[levelIndex];
      context.fillText(glyphs[density],x*cellWidth,(rows-y-1)*lineHeight);
    }
  }
  burst=Math.max(0,burst-.055);
  schedule();
}

function resize(){
  if(!context)return;
  const ratio=devicePixelRatio||1;
  canvas.width=Math.floor(canvas.clientWidth*ratio);
  canvas.height=Math.floor(canvas.clientHeight*ratio);
  context.setTransform(ratio,0,0,ratio,0,0);
  stop();
  draw(performance.now(),true);
}

on('turn',()=>{
  if(state.reduced())return;
  burst=1;
  stop();
  draw(performance.now(),true);
});
on('rain',event=>{level=event.detail;resize()});
on('theme',resize);
on('live',event=>{
  live=!!event.detail.npLive;
  if(!state.reduced()&&!document.hidden){stop();draw(performance.now(),true)}
});

if(canvas){
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible)draw(performance.now(),true);
    else stop();
  });
  observer.observe(canvas);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stop();
    else draw(performance.now(),true);
  });
  addEventListener('resize',resize);
  resize();
}
