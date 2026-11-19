import {SITE,TRACKS,PROJECTS,BSIDES,STACK,THEMES,COPY} from './data.js';import * as R from './render.js';import {state,setTheme,setRain,clearTurns,setLive} from './state.js';
const list=[...PROJECTS.map(x=>({...x,side:'A'})),...BSIDES.map(x=>({...x,side:'B'}))];
const LAST_PLAYED_KEY='portfolio.now-playing.last';
function rememberPlayback(v){if(!v?.track)return;try{localStorage.setItem(LAST_PLAYED_KEY,JSON.stringify({track:v.track,artist:v.artist||'',album:v.album||'',image:typeof v.image==='string'&&v.image.startsWith('https://i.scdn.co/')?v.image:'',url:typeof v.url==='string'&&v.url.startsWith('https://open.spotify.com/track/')?v.url:'',previewUrl:typeof v.previewUrl==='string'&&v.previewUrl.startsWith('https://p.scdn.co/')?v.previewUrl:'',playedAt:v.playedAt||new Date().toISOString()}))}catch{}}
function rememberedPlayback(){try{const v=JSON.parse(localStorage.getItem(LAST_PLAYED_KEY)||'null');if(!v||typeof v.track!=='string'||!v.track)return null;return{...v,live:false,paused:false,lastPlayed:true}}catch{return null}}
function rows(items,side,ctx){const d=R.el('section');items.forEach((p,i)=>d.append(R.row(p,i,side,ctx.run)));return d}
function addPreviewControl(actions,v,ctx){const audio=R.el('audio'),play=R.el('button','▶  Listen here','action player-play');audio.className='player-audio';audio.preload='none';audio.setAttribute('aria-label',`Preview of ${v.track} by ${v.artist}`);play.type='button';play.setAttribute('aria-label',`Play preview of ${v.track}`);play.addEventListener('click',()=>{if(audio.paused){audio.play().then(()=>{play.textContent='Ⅱ  Pause preview'}).catch(()=>{play.textContent='▶  Try preview again'})}else{audio.pause();play.textContent='▶  Listen here'}});audio.addEventListener('ended',()=>{play.textContent='▶  Listen here'});audio.addEventListener('pause',()=>{if(audio.currentTime>0)play.textContent='▶  Listen here'});actions.append(play,audio);const ready=preview=>{if(!preview?.previewUrl){play.remove();audio.remove();actions.append(R.el('span','No preview available for this track.','player-note'));return}audio.src=preview.previewUrl;play.disabled=false;play.textContent='▶  Listen here';if(preview.previewProvider==='Apple Music'&&preview.previewStoreUrl){const link=R.link('Listen on Apple Music ↗',preview.previewStoreUrl);link.setAttribute('aria-label','Listen on Apple Music');link.className='apple-music-badge-link';actions.append(link,R.el('span','Preview provided courtesy of iTunes.','player-note'))}};if(v.previewUrl){ready({previewUrl:v.previewUrl,previewProvider:v.previewProvider,previewStoreUrl:v.previewStoreUrl});return}play.disabled=true;play.textContent='Finding a preview…';const query=new URLSearchParams({track:v.track,artist:v.artist,album:v.album});ctx.live.get(`/api/preview?${query}`,ctx.signal).then(preview=>{if(actions.isConnected)ready(preview)},()=>{if(actions.isConnected)ready(null)})}
export function matchProjects(arg,items=list){const q=arg.toLowerCase().trim();if(!q)return[];const exact=items.find(x=>x.slug===q)||items.find(x=>x.title.toLowerCase()===q);return exact?[exact]:items.filter(x=>x.slug.includes(q)||x.title.toLowerCase().includes(q))}
function openProject(arg,ctx){let matches=matchProjects(arg),p=matches[0];if(matches.length>1&&!list.some(x=>x.slug===arg.toLowerCase()||x.title.toLowerCase()===arg.toLowerCase())){const d=R.el('section');d.append(R.bullet('Ambiguous project.'));d.append(rows(matches,p?.side||'A',ctx));return d}if(!p)return R.bullet(`cat: ${arg}: no such track`);const d=R.el('section');d.dataset.projectSlug=p.slug;d.append(R.el('h3',p.title),R.el('p',`${p.tags.join(' · ')} · ${p.year}`));if(p.cover){const img=R.el('img');img.src='/'+p.cover;img.alt='';img.className='cover';img.addEventListener('error',()=>img.remove(),{once:true});d.append(img)}else{const fallback=R.el('div',p.title.split(/\s+/).map(x=>x[0]).join('').slice(0,3),'generated-cover');fallback.style.setProperty('--tint',p.tint);d.append(fallback)}d.append(R.el('p',p.desc));if(p.blurb)d.append(R.el('p',p.blurb),R.el('p',p.stack.join(' · ')));if(p.url)d.append(R.link('↗ '+new URL(p.url).hostname,p.url));else d.append(R.el('p','UNRELEASED · in the studio'));d.append(R.el('p',`track ${String((p.side==='A'?PROJECTS:BSIDES).indexOf(p)+1).padStart(2,'0')} in ${p.side==='B'?'the lab':'selected work'} · ${p.dur}`));const side=p.side==='A'?PROJECTS:BSIDES,at=side.findIndex(x=>x.slug===p.slug),nav=R.el('p');const next=side[(at+1)%side.length],back=R.el('button','back: /work','action'),advance=R.el('button',`next: /projects ${next.slug}`,'action');back.addEventListener('click',()=>ctx.run(p.side==='A'?'/work':'/lab'));advance.addEventListener('click',()=>ctx.run('/projects '+next.slug));nav.append(advance,back);d.append(nav);return d}
export const COMMANDS=[];const add=(name,aliases,group,summary,run,args='')=>{if(typeof aliases==='string')[aliases,group,summary]=[group,summary,aliases];COMMANDS.push({name,aliases,group,summary,run,args})};
add('help',['?','commands','h'],'core','This list',ctx=>{
 const d=R.el('section',undefined,'help-index');
 d.append(R.el('p','Choose a command to run it. Type / anytime to search or autocomplete.','help-intro'));
 const groups=[['tracks','SELECTED WORK'],['core','SESSION TOOLS'],['live','LIVE DATA'],['lab','LAB · UTILITIES']];
 for(const [group,label] of groups){
  const commands=COMMANDS.filter(command=>command.group===group);
  if(!commands.length)continue;
  const section=R.el('section',undefined,'help-group'),heading=R.el('h3',undefined,'help-heading');
  heading.append(R.el('span',label),R.el('small',String(commands.length).padStart(2,'0')));
  const grid=R.el('div',undefined,'help-grid');
  for(const command of commands){
   const button=R.el('button',undefined,'help-command');button.type='button';
   button.append(R.el('code','/'+command.name+(command.args?' '+command.args:'')),R.el('span',command.summary,'help-summary'));
   button.addEventListener('click',()=>{if(command.args){const input=document.querySelector('#prompt');input.value='/'+command.name+' ';input.focus();input.dispatchEvent(new Event('input',{bubbles:true}))}else ctx.run('/'+command.name)});grid.append(button);
  }
  section.append(heading,grid);d.append(section);
 }
 d.append(R.el('p','Aliases work too. Try /work, /now-playing, or /themes.','help-footer'));
 return d;
});
add('work',['track 02','side-a'],'tracks','Selected work',c=>{const d=R.el('section');d.append(R.bullet(COPY.work),rows(PROJECTS,'A',c));return d});add('lab',['track 03'],'tracks','Experiments, games & other projects',c=>{const d=R.el('section');d.append(R.bullet(COPY.lab),rows(BSIDES,'B',c));return d});
add('about',['track 04','liner-notes','whoami','bio'],'tracks','Liner notes',c=>{const d=R.el('section');d.append(R.bullet(COPY.about),R.el('p',COPY.bio1,'indent'),R.el('p',COPY.bio2,'indent'),R.kv('contributions','—'),R.kv('streak','—'),R.kv('shipped',String([...PROJECTS,...BSIDES].filter(p=>!p.wip).length)),R.kv('in studio',String([...PROJECTS,...BSIDES].filter(p=>p.wip).length).padStart(2,'0')),R.el('p','WEB · AI · APPS · GAMES · WEB3 · TOOLS · AUTOMATION · LAB'));const req=c.live.call('github','/api/github',c.signal);d.append(req.line);req.data.then(v=>{d.children[3].lastChild.textContent=v.total.toLocaleString();d.children[4].lastChild.textContent=`${v.streak} days`},()=>{});d.append(R.el('p','/github for the graph · /stack for the mixer · /studio for what\'s next'));return d});
add('contact',['track 05','outro','email','hire'],'tracks','Outro — let’s talk',()=>{const d=R.el('section');d.append(R.bullet('Let\'s talk'),R.el('p','Got an idea, a project, or a song recommendation? All three are welcome.'));const copy=R.el('button','Copy email','action');copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(SITE.email);copy.textContent='Copied.';setTimeout(()=>copy.textContent='Copy email',2000)}catch{}});d.append(R.kv('email',R.link(SITE.email,'mailto:'+SITE.email),copy,'no spam, i promise'),R.kv('github',R.link('github.com/rkhooda',SITE.github),null,'where the code lives'),R.kv('linkedin',R.link('linkedin.com/in/rakshit-hooda',SITE.linkedin),null,'the formal version of me'),R.el('p','/sign to leave a note on the sleeve instead'));return d});
add('track',['t'],'tracks','Play a track by number',c=>{const n=parseInt(c.args.replace(/\D/g,''),10);const x=TRACKS[n-1];if(!x)return R.bullet(`Unknown command: /track ${c.args}. /help lists everything.`);return x.id==='work'?COMMANDS.find(a=>a.name==='work').run(c):x.id==='lab'?COMMANDS.find(a=>a.name==='lab').run(c):x.id==='about'?COMMANDS.find(a=>a.name==='about').run(c):x.id==='contact'?COMMANDS.find(a=>a.name==='contact').run(c):R.bullet(COPY.intro)},'<n>');
add('projects',[],'core','Open a project by name',c=>{if(c.args)return openProject(c.args,c);const d=R.el('section');d.append(rows(PROJECTS,'A',c),rows(BSIDES,'B',c));return d},'<project>');add('play',[],'hidden','Audio playback',()=>R.el('section'));add('clear',['cls','reset'],'core','Wipe the transcript (Ctrl+L)',()=>{clearTurns();return R.bullet(COPY.intro)});
add('themes',['colors','colours'],'core','List and choose a theme',()=>{const d=R.el('section',undefined,'theme-picker');d.append(R.bullet('Themes'));const options=[];const updateCurrent=()=>options.forEach(({button,status,theme})=>{const current=state.theme()===theme.name;button.setAttribute('aria-pressed',String(current));status.textContent=current?'← current':''});for(const t of THEMES){const b=R.el('button',undefined,'theme-row action');b.type='button';b.setAttribute('aria-label',`${t.name} — ${t.desc}`);const sw=R.el('span',undefined,'swatch');sw.dataset.theme=t.name;for(const token of ['--bg','--surface','--accent','--rain-2']){const cell=R.el('i');cell.style.backgroundColor=`var(${token})`;sw.append(cell)}const copy=R.el('span',undefined,'theme-copy'),title=R.el('strong',t.name,'theme-name'),desc=R.el('span',t.desc,'theme-description'),status=R.el('span','','theme-current');copy.append(title,desc,status);b.append(sw,copy);b.addEventListener('click',()=>{setTheme(t.name);updateCurrent()});d.append(b);options.push({button:b,status,theme:t})}updateCurrent();return d});
function ago(date){if(!date)return'just now';const sec=(Date.now()-new Date(date).getTime())/1000;for(const [unit,size] of [['day',86400],['hour',3600],['minute',60]])if(sec>=size)return new Intl.RelativeTimeFormat('en',{numeric:'auto',style:'narrow'}).format(-Math.floor(sec/size),unit);return'just now'}
function asyncBlock(ctx,service,url,finish,fallback){const root=R.el('section'),req=ctx.live.call(service,url,ctx.signal);root.append(req.line);req.data.then(data=>finish(root,data),()=>{if(!ctx.signal.aborted)root.append(typeof fallback==='function'?fallback():R.el('p',fallback))});return root}
add('now-playing',"What's on, via Spotify",['np','listening','music','spotify','playing'],'live',c=>{const root=R.el('section',undefined,'player-section');root.append(R.el('p','A little soundtrack from my side.','player-intro'));const req={data:c.live.get('/api/nowplaying',c.signal)};const show=v=>{if(!v?.track)v=rememberedPlayback()||v;rememberPlayback(v);setLive({np:v,npLive:!!v.live});const key=`${v.url}|${v.track}`,existing=root.querySelector('.player');if(existing&&existing.dataset.trackKey===key){const eyebrow=existing.querySelector('.player-eyebrow'),visualizer=existing.querySelector('.audio-visualizer');if(eyebrow)eyebrow.lastChild.textContent=v.live?'Now listening':v.lastPlayed?'Last in the headphones':'Paused on';if(visualizer){visualizer.classList.toggle('paused',!v.live);visualizer.setAttribute('aria-label',v.live?'Music is playing':'Playback is paused')}return}root.querySelector('.player')?.remove();root.querySelector('.player-embed')?.remove();root.querySelector('.player-state')?.remove();if(!v.track){root.append(R.el('p','No listening history · via Spotify','player-state'));return}const player=R.el('div',undefined,'player'),art=R.el('div',undefined,'player-art');player.dataset.trackKey=key;if(v.image){const img=R.el('img');img.src=v.image;img.alt=`${v.album} album cover`;img.loading='lazy';art.append(img)}else art.append(R.el('span','◉'));const info=R.el('div',undefined,'player-info'),stateLabel=v.live?'Now listening':v.lastPlayed?'Last in the headphones':'Paused on',title=R.el('strong',v.track,'player-title');const eyebrow=R.el('p',undefined,'player-eyebrow');eyebrow.append(R.el('span','🎧','player-headphones'),document.createTextNode(stateLabel));info.append(eyebrow,title,R.el('p',`${v.artist} · ${v.album}`,'player-meta'));const visualizer=R.el('div',undefined,`audio-visualizer${v.live?'':' paused'}`);visualizer.setAttribute('role','img');visualizer.setAttribute('aria-label',v.live?'Music is playing':'Playback is paused');const heights=[24,45,32,72,50,88,38,62,100,54,78,35,66,42,84,28,58,92,46,70];heights.forEach((height,i)=>{const bar=R.el('span');bar.style.setProperty('--bar-height',`${height}%`);bar.style.animationDelay=`${(i%7)*-.13}s`;visualizer.append(bar)});info.append(visualizer);const played=Date.parse(v.playedAt);if(v.lastPlayed&&v.playedAt&&Number.isFinite(played)){const minutes=Math.floor(Math.max(0,Date.now()-played)/60000),relative=minutes<60?`${minutes}m ago`:minutes<1440?`${Math.floor(minutes/60)}h ago`:`${Math.floor(minutes/1440)}d ago`;info.append(R.el('p',`I last played this ${relative}.`,'player-note'))}const actions=R.el('div',undefined,'player-actions');addPreviewControl(actions,v,c);if(v.url)actions.append(R.link('Open in Spotify ↗',v.url));actions.append(R.link('Find me on Spotify ↗','https://open.spotify.com/user/rkhooda'));info.append(actions);player.append(art,info);root.append(player)};req.data.then(v=>{show(v);c.live.watchNowPlaying(root,show)},()=>{const previous=rememberedPlayback();if(previous){show(previous);root.append(R.el('p','Spotify is offline. Showing the last track I heard.','player-note'));return}setLive({np:null,npLive:false});root.append(R.el('p',COPY.offline))});return root});
add('github','Contributions, last 12 months',['graph','contributions','commits','gtb'],'live',c=>asyncBlock(c,'github','/api/github',(d,v)=>{d.firstChild.textContent=`⎿ github: ${v.total.toLocaleString()} contributions · ${v.streak} day streak`;d.append(R.bullet('rkhooda on GitHub'));const calendar=v.days.map((count,index)=>{const date=new Date(`${v.from}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+index);return{date:date.toISOString().slice(0,10),count}}),maximum=Math.max(1,...v.days),graph=R.el('div',undefined,'graph-wrap'),grid=R.el('div',undefined,'graph'),offset=(new Date(`${v.from}T00:00:00Z`).getUTCDay()+6)%7,columns=Math.ceil((offset+calendar.length)/7);grid.setAttribute('role','grid');grid.setAttribute('aria-label','GitHub contributions over the past year');for(let col=0;col<columns;col++){const week=R.el('div',undefined,'graph-week');week.setAttribute('role','row');week.style.setProperty('--week-index',col);for(let row=0;row<7;row++){const index=col*7+row-offset,day=calendar[index],level=day?Math.min(4,Math.ceil(day.count*4/maximum)):0,cell=R.el('span',undefined,`level-${level}`);if(day){const label=`${day.date}: ${day.count} contributions`;cell.title=label;cell.setAttribute('aria-label',label);cell.setAttribute('role','gridcell')}else cell.setAttribute('aria-hidden','true');week.append(cell)}grid.append(week)}graph.append(grid);d.append(graph,R.link('↗ github.com/rkhooda',SITE.github))},"GitHub isn't answering. The commits are still there: github.com/rkhooda"));
add('studio',['queue','wip','next','building'],'live','Projects in development',c=>{const entries=[...PROJECTS,...BSIDES].filter(p=>p.wip),d=R.el('section');d.append(R.bullet(COPY.studio));if(entries.length)d.append(rows(entries,'',c));else d.append(R.el('p','Nothing in development right now.'));return d});
add('guestbook','Read the sleeve',['sleeve','signatures'],'live',c=>asyncBlock(c,'upstash','/api/guestbook',(d,v)=>{d.append(R.bullet(`Signatures · ${v.count}`),R.tool(`upstash: ${v.count} total, showing ${v.items.length}`));if(!v.items.length)d.append(R.el('p','Nobody has signed yet. /sign to be first.'));for(const x of v.items.slice(0,c.args==='all'?50:10))d.append(R.el('p',`${x.n}  ${x.m}  ${ago(x.t)}`));d.append(R.el('p','/guestbook all for the rest · /sign to add yours'))},'The sleeve is in the other room. Try again in a minute.'));
add('version','Version',['v','about-site'],'live',c=>asyncBlock(c,'version','/api/version',(d,v)=>d.append(R.bullet(`portfolio ${SITE.version}${v.sha?' · '+v.sha:''}${v.ref?' · '+v.ref:''} · deps: 0 · build step: none`)),()=>R.bullet(`portfolio ${SITE.version} · deps: 0 · build step: none`)));
add('status','Time, streak, what\'s building, what\'s playing',['uptime','now'],'live',c=>{const d=R.el('section'),t=new Intl.DateTimeFormat('en-GB',{timeZone:SITE.timezone,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()),h=Number(t.slice(0,2));d.append(R.bullet('Status'),R.kv('time',`${t} IST · ${h>=9||h<2?'probably awake':'probably asleep'}`),R.kv('streak','—'),R.kv('building',PROJECTS.find(p=>p.wip)?.title||'—'),R.kv('playing','—'));c.live.get('/api/github',c.signal).then(v=>{if(!c.signal.aborted)d.children[2].lastChild.textContent=`${v.streak} days`}).catch(()=>{});c.live.get('/api/nowplaying',c.signal).then(v=>{if(c.signal.aborted)return;setLive({np:v,npLive:!!v.live});const playback=v.live?`${v.track} — ${v.artist}`:v.lastPlayed&&v.track?`Last played: ${v.track} — ${v.artist} · ${ago(v.playedAt)}`:v.track?`Paused: ${v.track} — ${v.artist}`:'not playing';d.children[4].lastChild.textContent=playback}).catch(()=>{});return d});
add('sign',['guestbook sign','signature'],'live','Sign the sleeve',c=>{const d=R.el('section'),form=R.el('form'),name=R.el('input'),note=R.el('input'),website=R.el('input'),error=R.el('p'),send=R.el('button','Sign','action'),cancel=R.el('button','Cancel','action');d.append(R.bullet('Sign the sleeve'));name.name='name';name.id='guest-name';name.required=true;name.maxLength=24;name.setAttribute('aria-label','name');note.id='guest-note';note.required=true;note.maxLength=140;note.setAttribute('aria-label','note');website.name='website';website.tabIndex=-1;website.autocomplete='off';website.className='honeypot';send.type='submit';cancel.type='button';const nameLabel=R.el('label','name');nameLabel.htmlFor='guest-name';const noteLabel=R.el('label','note');noteLabel.htmlFor='guest-note';form.append(nameLabel,name,R.el('span','24 max','muted'),noteLabel,note,R.el('span','140 max','muted'),website,send,cancel,error);d.append(form);cancel.addEventListener('click',()=>form.remove());form.addEventListener('submit',async e=>{e.preventDefault();send.disabled=true;try{const r=await fetch('/api/guestbook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name.value,note:note.value,website:website.value}),signal:c.signal}),data=await r.json().catch(()=>null);if(!r.ok||data?.error)throw Error(data?.error||'offline');form.replaceWith(R.el('p','Signed. Thanks for listening.'));if(data.entry)d.append(R.el('p',`${data.entry.n}  ${data.entry.m}`))}catch(err){if(c.signal.aborted)return;error.textContent=['one signature an hour — come back later',"that word isn't welcome here",'a name (1-24) and a note (1-140) are both required'].includes(err.message)?err.message:COPY.signOffline}finally{send.disabled=false}});return d});add('resume',['cv'],'core','Résumé (PDF)',()=>{const d=R.el('section');d.append(R.bullet('Résumé — opens as PDF.'));fetch('/resume.pdf',{method:'HEAD'}).then(r=>{if(r.ok){const a=R.link('Résumé — opens as PDF.','/resume.pdf');a.target='_blank';d.append(a)}else d.append(R.el('p','The résumé is being remastered. Email me instead: /contact'))}).catch(()=>d.append(R.el('p','The résumé is being remastered. Email me instead: /contact')));return d});add('share',[],'core','Copy a link',()=>{const url=location.href,d=R.el('section'),p=R.bullet(`Copy this: ${url}`);d.append(p);if(navigator.clipboard)navigator.clipboard.writeText(url).then(()=>{p.textContent=`● Link copied: ${url}`}).catch(()=>{});return d});
const STACK_PROJECTS={
 'JavaScript / TypeScript':[{title:'Portfolio 2.0',slug:'portfolio-2'},{title:'Bellsy',slug:'bellsy'},{title:'FlowPane',slug:'flowpane'}],
 'HTML / CSS':[{title:'Portfolio 2.0',slug:'portfolio-2'},{title:'MaanKiBaat',slug:'maankibaat'}],
 'Node':[{title:'Bellsy',slug:'bellsy'},{title:'Cult-Bot',slug:'cult-bot'}],
 'Claude Code / agentic workflows':[{title:'Multiagent Builder',slug:'multiagent-builder'},{title:'Developer Brain',slug:'developer-brain'}],
 'Vercel':[{title:'CredVault',slug:'credvault'},{title:'Clixo',slug:'clixo'},{title:'Cult-Bot',slug:'cult-bot'},{title:'Bellsy',slug:'bellsy'}],
 'Linux':[{title:'Cult-Bot',slug:'cult-bot'},{title:'Developer Brain',slug:'developer-brain'}],
 'React / Next.js':[{title:'CredVault',slug:'credvault'},{title:'Clixo',slug:'clixo'},{title:'Cult-Bot',slug:'cult-bot'},{title:'StatisticalStudies',slug:'statisticalstudies'}],
 'Python / FastAPI':[{title:'Recipify',slug:'recipify'},{title:'SlotMachine',slug:'slotmachine'},{title:'Payline Slot',slug:'payline-slot-engine'}],
 'PostgreSQL / Prisma':[{title:'Cult-Bot',slug:'cult-bot'},{title:'StatisticalStudies',slug:'statisticalstudies'}],
 'Supabase':[{title:'ProcrastiNO',slug:'procrastino'},{title:'StatisticalStudies',slug:'statisticalstudies'}],
 'Solidity':[{title:'CredVault',slug:'credvault'},{title:'Clixo',slug:'clixo'}],
 'Ethers / wallets':[{title:'CredVault',slug:'credvault'},{title:'Clixo',slug:'clixo'}],
 'LangGraph / agent pipelines':[{title:'Multiagent Builder',slug:'multiagent-builder'}],
 'Tailwind':[{title:'CredVault',slug:'credvault'},{title:'ProcrastiNO',slug:'procrastino'}],
 'React Native / Expo':[{title:'ProcrastiNO',slug:'procrastino'}],
 'discord.js':[{title:'Cult-Bot',slug:'cult-bot'}],
 'Three.js / GSAP':[{title:'Lab Visuals',slug:'lab'}],
 'Tauri + Rust':[{title:'FlowPane',slug:'flowpane'}],
 'Redis (Upstash)':[{title:'Guestbook API',slug:'guestbook'}],
 'LLM routing (litellm)':[{title:'Multiagent Builder',slug:'multiagent-builder'}],
 'VS Code extension API':[{title:'Bellsy',slug:'bellsy'}],
 'Pygame':[{title:'Flappy-Bird',slug:'flappy-bird'},{title:'Snake',slug:'snake'}],
 'Docker':[{title:'Agent Sandbox',slug:'multiagent-builder'}]
};
function renderStackMixer(ctx){
 const root=R.el('section',undefined,'stack-mixer');
 const head=R.el('div',undefined,'stack-header');
 head.append(R.bullet('The mixer — console signal chain & tech stack'));
 head.append(R.el('p','Analog-style channel strips ordered by fader level (daily drivers at top). Click any project chip to inspect.','muted'));
 const stats=R.el('div',undefined,'stack-stats');
 const s1=R.el('span',undefined,'stack-stat-pill'),b1=R.el('b','23');s1.append(b1,document.createTextNode(' CHANNELS'));
 const s2=R.el('span',undefined,'stack-stat-pill'),b2=R.el('b','6');s2.append(b2,document.createTextNode(' DAILY (+6dB)'));
 const s3=R.el('span',undefined,'stack-stat-pill'),b3=R.el('b','10');s3.append(b3,document.createTextNode(' ROTATION (0dB)'));
 const s4=R.el('span',undefined,'stack-stat-pill'),b4=R.el('b','7');s4.append(b4,document.createTextNode(' LAB (-6dB)'));
 stats.append(s1,s2,s3,s4);
 head.append(stats);
 const filtersWrap=R.el('div',undefined,'stack-filters');
 const filterDefs=[
  {id:'all',label:'ALL (23)'},
  {id:'daily',label:'DAILY (6)'},
  {id:'often',label:'ROTATION (10)'},
  {id:'dabbled',label:'LAB (7)'},
  {id:'AI',label:'AI'},
  {id:'WEB3',label:'WEB3'},
  {id:'FRONTEND',label:'FRONTEND'},
  {id:'BACKEND',label:'BACKEND'},
  {id:'INFRA',label:'INFRA'},
  {id:'APPS & TOOLS',label:'TOOLS'}
 ];
 let currentFilter='all';
 const filterBtns=[];
 const tierSections=[];
 filterDefs.forEach(f=>{
  const btn=R.el('button',f.label,'stack-filter-btn');
  btn.type='button';
  if(f.id==='all')btn.classList.add('active');
  btn.setAttribute('aria-pressed',f.id==='all'?'true':'false');
  btn.addEventListener('click',()=>{
   currentFilter=f.id;
   filterBtns.forEach(b=>{
    const active=b.dataset.filter===currentFilter;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',String(active));
   });
   tierSections.forEach(({tierEl,cards})=>{
    let visibleCount=0;
    cards.forEach(({card,item})=>{
     const match=currentFilter==='all'||item.level===currentFilter||item.channel===currentFilter;
     card.style.display=match?'flex':'none';
     if(match)visibleCount++;
    });
    tierEl.style.display=visibleCount>0?'block':'none';
   });
  });
  btn.dataset.filter=f.id;
  filterBtns.push(btn);
  filtersWrap.append(btn);
 });
 head.append(filtersWrap);
 root.append(head);
 const tiers=[
  {id:'daily',gain:'+6 dB',pct:'100%',name:'MASTER BUS · DAILY DRIVERS',desc:'Primary production instruments & daily workflows — highest gain & mastery'},
  {id:'often',gain:'0 dB',pct:'70%',name:'HEAVY ROTATION · CORE PRODUCTION',desc:'High-frequency production tools, frameworks & backends'},
  {id:'dabbled',gain:'-6 dB',pct:'35%',name:'LAB RACK · EXPLORING & AUX',desc:'Specialized desktop engines, graphics & experimental tools'}
 ];
 tiers.forEach(tier=>{
  const items=STACK.filter(s=>s.level===tier.id);
  if(!items.length)return;
  const tierEl=R.el('div',undefined,`stack-tier tier-${tier.id}`);
  const thead=R.el('div',undefined,'stack-tier-head');
  const title=R.el('h4',undefined,'stack-tier-title');
  title.append(R.el('span',tier.name),R.el('span',tier.gain,'stack-tier-gain'));
  const tdesc=R.el('p',tier.desc,'stack-tier-desc');
  thead.append(title,tdesc);
  tierEl.append(thead);
  const grid=R.el('div',undefined,'stack-grid');
  const tierCards=[];
  items.forEach(item=>{
   const card=R.el('div',undefined,'stack-card');
   card.dataset.level=item.level;
   card.dataset.channel=item.channel;
   const top=R.el('div',undefined,'stack-card-top');
   top.append(R.el('span',item.channel,'stack-card-channel'),R.el('span',`${tier.gain} · ${item.level.toUpperCase()}`,'stack-card-level'));
   const name=R.el('h5',item.instrument,'stack-card-name');
   const fader=R.el('div',undefined,'stack-fader');
   const bar=R.el('div',undefined,'stack-fader-bar');
   bar.style.width=tier.pct;
   const thumb=R.el('div',undefined,'stack-fader-thumb');
   thumb.style.left=tier.pct;
   fader.append(bar,thumb);
   const ticks=R.el('div',undefined,'stack-fader-ticks');
   ['-12dB','-6dB','0dB','+3dB','+6dB'].forEach(tick=>ticks.append(R.el('span',tick)));
   card.append(top,name,fader,ticks);
   const projects=STACK_PROJECTS[item.instrument]||[];
   if(projects.length){
    const proof=R.el('div',undefined,'stack-card-proof');
    proof.append(R.el('span','proven in:','stack-card-proof-label'));
    projects.forEach(p=>{
     const chip=R.el('button',p.title+' ↗','stack-proof-btn action');
     chip.type='button';
     chip.setAttribute('aria-label',`Open ${p.title}`);
     chip.addEventListener('click',()=>{
      if(p.slug==='lab'||p.slug==='guestbook')ctx.run('/'+p.slug);
      else ctx.run('/projects '+p.slug);
     });
     proof.append(chip);
    });
    card.append(proof);
   }
   grid.append(card);
   tierCards.push({card,item});
  });
  tierEl.append(grid);
  root.append(tierEl);
  tierSections.push({tierEl,cards:tierCards});
 });
 return root;
}
const LINKS=[
 {badge:'PORTFOLIO',title:'Personal Outpost',url:'https://rakshit.is-a.dev/',displayUrl:'rakshit.is-a.dev',desc:'Original personal site & creative development showcase'},
 {badge:'CODE',title:'GitHub',url:SITE.github,displayUrl:'github.com/'+SITE.githubUser,desc:'Open-source repositories, AI agents, Web3 contracts & lab projects'},
 {badge:'NETWORK',title:'LinkedIn',url:SITE.linkedin,displayUrl:'linkedin.com/in/rakshit-hooda',desc:'Professional experience, track record & engineering background'},
 {badge:'RESUME',title:'Remastered Résumé',url:'/resume.pdf',displayUrl:'resume.pdf',desc:'Curriculum Vitae — education, technical skills & verified shipped work'},
 {badge:'CONTACT',title:'Direct Inbox',url:'mailto:'+SITE.email,displayUrl:SITE.email,desc:'Direct line — questions, collaboration ideas, or song recommendations'},
 {badge:'MUSIC',title:'Spotify Profile',url:'https://open.spotify.com/user/rkhooda',displayUrl:'open.spotify.com/user/rkhooda',desc:'Curated playlists, soundtracks & album rotations behind the code'}
];
function renderLinksHub(){
 const root=R.el('section',undefined,'links-section');
 root.append(R.bullet('Signal outposts — all links & destinations'));
 root.append(R.el('p','Direct links to external profiles, alternate portfolios, code repositories, and résumé.','links-intro'));
 const grid=R.el('div',undefined,'links-grid');
 LINKS.forEach(linkItem=>{
  const card=R.el('div',undefined,'link-card');
  const header=R.el('div',undefined,'link-card-header');
  header.append(R.el('span',linkItem.badge,'link-badge'),R.el('span','↗','link-external-icon'));
  const title=R.el('h4',linkItem.title,'link-title');
  const urlLink=R.link(linkItem.displayUrl,linkItem.url);
  urlLink.className='link-url';
  const desc=R.el('p',linkItem.desc,'link-desc');
  const actions=R.el('div',undefined,'link-card-actions');
  const openBtn=R.link('Open ↗',linkItem.url);
  openBtn.className='link-open-btn';
  const copyBtn=R.el('button','Copy link','link-copy-btn');
  copyBtn.type='button';
  copyBtn.addEventListener('click',async e=>{
   e.stopPropagation();
   try{
    const copyTarget=linkItem.url.startsWith('mailto:')?linkItem.url.replace(/^mailto:/,''):(linkItem.url.startsWith('/')?location.origin+linkItem.url:linkItem.url);
    await navigator.clipboard.writeText(copyTarget);
    copyBtn.textContent='Copied!';
    setTimeout(()=>copyBtn.textContent='Copy link',2000);
   }catch{
    copyBtn.textContent='Copied!';
    setTimeout(()=>copyBtn.textContent='Copy link',2000);
   }
  });
  actions.append(openBtn,copyBtn);
  card.append(header,title,urlLink,desc,actions);
  grid.append(card);
 });
 root.append(grid);
 return root;
}
add('links',['link','socials','urls','connect'],'core','All external links & outposts',()=>renderLinksHub());
add('stack',['skills','tools','tech'],'lab','Mixer — console signal chain & tech stack',c=>renderStackMixer(c));
add('shuffle',['random','surprise'],'lab','Random project',c=>{const choices=list.filter(x=>!x.wip),pick=choices[Math.floor(Math.random()*choices.length)];if(state.reduced())return openProject(pick.slug,c);const d=R.el('section');d.dataset.projectSlug=pick.slug;const headline=R.bullet('Shuffling…');d.append(headline);let i=0;const flicker=setInterval(()=>{headline.textContent=choices[(i++)%choices.length].title},75);setTimeout(()=>{clearInterval(flicker);if(!d.isConnected)return;const card=openProject(pick.slug,c);d.replaceChildren(...card.childNodes)},600);return d});add('timeline',['discography','years'],'lab','Discography',c=>{const d=R.el('section');d.append(R.bullet('Discography'));for(const y of [...new Set(list.map(x=>x.year))].sort().reverse()){d.append(R.el('p',`${y} ─┬─`));const tracks=list.filter(x=>x.year===y);tracks.forEach((p,i)=>{const b=R.el('button',`${i===tracks.length-1?'└─':'├─'} ${p.title}   ${p.tags[0]}${p.wip?' · in the studio':''}`,'action timeline-row');b.addEventListener('click',()=>c.run('/projects '+p.slug));d.append(b)})}return d});add('ascii',['banner','logo'],'lab','Banner',()=>{const d=R.el('section',undefined,'ascii-card'),art=R.el('pre',undefined,'ascii-art ascii'),lines=COPY.ascii.split('\n'),frame=['╭─ RAKSHIT HOODA · LAB '+ '─'.repeat(18)+'╮',...lines.map(line=>'│ '+line+' │'),'╰'+ '─'.repeat(76)+'╯'];frame.forEach((line,i)=>{art.append(R.el('span',line,'ascii-line'));if(i<frame.length-1)art.append(document.createTextNode('\n'))});d.append(art);return d});const files=[['work/        09 tracks','/work'],['lab/          06 projects','/lab'],['about.md','/about'],['contact.md','/contact'],['now-playing','/now-playing'],['themes/','/themes'],['resume.pdf','/resume']];add('ls',['dir','tree'],'lab','List files',c=>{const d=R.el('section');for(const [label,path] of files){const b=R.el('button',label,'action');b.addEventListener('click',()=>c.run(path));d.append(b)}return d});add('cat',[],'lab','Read a file',c=>{const key=c.args.toLowerCase().replace(/^\//,'');const item=files.find(([label,path])=>path.slice(1)===key||label.trim().replace(/\/$/,'')===key);if(item){c.run(item[1]);return R.el('p','')}return R.bullet(`cat: ${c.args}: no such track`)},'<file>');add('eq',['rain','spectrum'],'lab','Spectrum level',c=>{if(['off','ambient','loud'].includes(c.args))setRain(c.args);return R.bullet(`${state.rain()} · off · ambient · loud`)},'<level>');add('history',[],'lab','Command history',c=>{const d=R.el('section');for(const command of state.history()){const b=R.el('button',command,'action');b.addEventListener('click',()=>c.run(command));d.append(b)}return d});add('credits',['footer','colophon'],'lab','Credits',()=>R.el('pre','Built with caffeine and questionable decisions.\nType: JetBrains Mono. Hosting: Vercel. Now playing: Spotify.\nFrameworks: none. Dependencies: none. Build step: none.\nEnd of the lab — thanks for stopping by.'));
add('sudo',[],'hidden','sudoers',()=>R.bullet('rkhooda is not in the sudoers file. This incident will be reported.'));add('rm',[],'hidden','remove',()=>R.bullet('Permission denied. Nice try.'));add('vim',['vi','nano'],'hidden','vim',()=>{import('./state.js').then(m=>m.armVim());return R.bullet("You're in vim now. :q to leave. (I know.)")});add('exit',['quit','q'],'hidden','exit',()=>R.bullet("There's no exit. It's a website. ⌘W works though."));add('matrix',[],'hidden','matrix',c=>{if(state.reduced())return R.bullet('Green mode for five seconds. Don\'t tell anyone.');const old=state.rain();setRain('loud');document.documentElement.classList.add('matrix');setTimeout(()=>{setRain(old);document.documentElement.classList.remove('matrix')},5000);return R.bullet('Green mode for five seconds. Don\'t tell anyone.')});
