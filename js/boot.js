import {loadState,state} from './state.js';import {startShell} from './shell.js';import './rain.js';import './live.js';
loadState();
const boot=document.querySelector('#boot'),prompt=document.querySelector('#prompt'),hints=['/now-playing','/help','/work','/themes','type / for commands'];let hintIndex=0;
function start(){startShell()}
function sequence(){let done=false,timer;const lines=['rk-portfolio 2.0 · booting',`⎿ loading tracks ........ ok  ${String(9).padStart(2,'0')} side A · ${String(6).padStart(2,'0')} side B`,'⎿ tuning last.fm ........ ok','⎿ warming the spectrum .. ok','> ready. type /help'];const finish=()=>{if(done)return;done=true;clearTimeout(timer);removeEventListener('keydown',skip);boot.hidden=true;boot.replaceChildren();try{sessionStorage.setItem('booted','1')}catch{}start()};const skip=()=>finish();let i=0;const print=()=>{if(done)return;if(i<lines.length){const line=document.createElement('p');line.textContent=lines[i++];boot.append(line);timer=setTimeout(print,140)}else timer=setTimeout(finish,120)};addEventListener('keydown',skip,{once:true});boot.hidden=false;print()}
let already=false;try{already=sessionStorage.getItem('booted')==='1'}catch{}if(state.reduced()||already)start();else sequence();

setInterval(()=>{if(prompt&&!prompt.value&&document.activeElement!==prompt)prompt.placeholder=hints[(hintIndex++)%hints.length]},6000);
