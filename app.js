const $ = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => [...r.querySelectorAll(q)];
const LS = {
  get(k,d){ try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d}},
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)) }
};
const S = { mode:'home', mission:null, public:'ado', difficulty:'aventure', step:0, score:0, hints:0, session:null };
const difficultyIndex = {decouverte:0,aventure:1,expert:2};
const labels = {decouverte:'Découverte',aventure:'Aventure',expert:'Expert', enfant:'Enfant', ado:'Ado', adulte:'Adulte'};
const app = $('#app');

if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});

function statFor(m){ const i=difficultyIndex[S.difficulty]; return { km:m.km[S.public][i], d:m.dplus[i], steps:i+4, time:S.public==='adulte' ? ['90 à 130','130 à 200','180 à 260'][i] : S.public==='ado' ? ['45 à 70','70 à 110','100 à 150'][i] : ['25 à 40','40 à 65','55 à 90'][i] }; }
function logo(){return `<img class="logo" src="assets/logo.png" alt="FAFATRAINING">`}
function nav(title='', back=true){return `<header class="topbar">${back?`<button class="round" onclick="go('home')">←</button>`:''}<div class="brandmini">${logo()}<span>${title}</span></div><button class="round" onclick="go('admin')">Admin</button></header>`}
function go(mode){ S.mode=mode; render(); window.scrollTo(0,0); }
function selectMission(id){ S.mission = FAFA_MISSIONS.find(m=>m.id===id); go('setup'); }
function render(){ app.innerHTML = views[S.mode](); bind(); }

const views = {
 home(){return `
 <main class="screen home">
  <section class="heroGame">
   <div class="heroLogo">${logo()}</div>
   <div class="heroText"><small>FAFATRAINING</small><h1>GAME ARENA</h1><p>Plateforme d'escape game dématérialisée : choisis une mission, suis l’histoire, résous les énigmes et avance sur le terrain.</p><div class="actions"><button class="primary" onclick="go('missions')">Jouer</button><button class="ghost" onclick="go('admin')">Créer une session</button></div></div>
   <div class="quickStats"><b>🧩 énigmes</b><b>🗺️ carte</b><b>🔊 audio</b><b>🎭 scénario</b></div>
  </section>
  <section class="how"><h2>Comment ça marche ?</h2><div class="steps"><article>1<span>Choisis un village</span></article><article>2<span>Sélectionne ton public</span></article><article>3<span>Lance la mission</span></article><article>4<span>Résous et progresse</span></article></div></section>
  <section><div class="sectionTitle"><h2>Missions disponibles</h2><button class="mini" onclick="go('missions')">Voir tout</button></div><div class="rail">${FAFA_MISSIONS.slice(0,6).map(card).join('')}</div></section>
 </main>`},
 missions(){return `${nav('Choisir une mission')}<main class="screen"><section class="sectionTitle"><h1>Choisis ton point de départ</h1><p>Chaque village propose une mission complète avec variantes enfant, ado et adulte.</p></section><div class="gridCards">${FAFA_MISSIONS.map(card).join('')}</div></main>`},
 setup(){const m=S.mission||FAFA_MISSIONS[0], st=statFor(m);return `${nav(m.village)}<main class="screen setup">
 <section class="missionHero" style="--accent:${m.color}"><div><small>${m.title}</small><h1>${m.village}</h1><p>${m.tone}</p></div><div class="badges"><b>👤 ${labels[S.public]}</b><b>⚡ ${labels[S.difficulty]}</b><b>📏 ${st.km} km</b><b>⛰️ ${st.d}m D+</b></div></section>
 <section class="wizard">
  <article><h2>1. Public</h2><p>Le jeu adapte les textes, les indices et la difficulté.</p><div class="seg">${['enfant','ado','adulte'].map(x=>`<button class="${S.public===x?'on':''}" data-public="${x}">${labels[x]}</button>`).join('')}</div></article>
  <article><h2>2. Style</h2><p>Découverte = accessible, Expert = plus long et plus exigeant.</p><div class="seg">${['decouverte','aventure','expert'].map(x=>`<button class="${S.difficulty===x?'on':''}" data-diff="${x}">${labels[x]}</button>`).join('')}</div></article>
  <article><h2>3. Mission</h2><div class="impact"><b>⏱️ ${st.time} min</b><b>📏 ${st.km} km</b><b>⛰️ ${st.d}m D+</b><b>🎯 ${st.steps} étapes</b></div><button class="primary wide" onclick="startMission()">Commencer la mission</button></article>
 </section>
 <details class="advanced"><summary>Options avancées</summary><div class="toggles"><label><input type="checkbox" checked> Audio guide</label><label><input type="checkbox" checked> Mini-carte</label><label><input type="checkbox" checked> Indices avec pénalité</label><label><input type="checkbox"> Bonus facultatifs</label></div></details>
 </main>`},
 intro(){const m=S.mission; return `${nav('Briefing mission')}<main class="screen narrow"><section class="brief" style="--accent:${m.color}"><small>${m.title}</small><h1>${m.village}</h1><p>Une trace a été brouillée dans le village. Ton équipe doit reconstituer le parcours, observer les lieux et débloquer chaque étape avant le final.</p><button class="sound" onclick="speakIntro()">🔊 Écouter le briefing</button><button class="primary wide" onclick="go('play')">Entrer dans la mission</button></section></main>`},
 play(){const m=S.mission, list=activeSteps(), e=list[S.step]||list.at(-1), q=e.variants[S.public][S.difficulty], progress=Math.round((S.step/list.length)*100); return `${nav('Mission en cours')}<main class="game">
  <aside class="missionSide"><h2>${m.village}</h2><div class="progress"><i style="width:${progress}%"></i></div><p>${S.step+1}/${list.length} étapes</p><button class="ghost wide" onclick="showHint()">💡 Indice (-5 pts)</button><button class="ghost wide" onclick="go('missions')">Changer mission</button></aside>
  <section class="playCard"><small>📍 Se rendre au lieu</small><h1>${e.place}</h1><div class="mapBox"><div class="pin">📍</div><span>Mini-carte terrain<br><em>GPS actif si autorisé</em></span></div><h2>Énigme</h2><p class="question">${q}</p><input id="answer" placeholder="Tape ta réponse ou ton code"/><div class="actions"><button class="primary" onclick="validateAnswer()">Valider</button><button class="ghost" onclick="skipStep()">Passer en animation</button></div><div id="feedback"></div></section>
 </main>`},
 end(){return `${nav('Mission terminée')}<main class="screen narrow"><section class="final"><h1>Mission réussie</h1><p>Score final : <b>${S.score}</b> points</p><div class="trophy">🏆</div><button class="primary wide" onclick="go('missions')">Choisir une autre mission</button><button class="ghost wide" onclick="restart()">Rejouer</button></section></main>`},
 admin(){return `${nav('Mode administrateur', false)}<main class="screen admin"><section class="adminHero"><div>${logo()}</div><div><small>MODE ORGANISATEUR</small><h1>Créer une session</h1><p>Prépare une partie en quelques étapes. L’app génère un code session, une répartition d’équipes et un guide animateur.</p></div></section><section class="adminGrid"><label>Mission<select id="amission">${FAFA_MISSIONS.map(m=>`<option value="${m.id}">${m.village} — ${m.title}</option>`)}</select></label><label>Nombre de joueurs<input id="aplayers" type="number" min="1" value="12"></label><label>Nombre d’équipes<select id="ateams"><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></label><label>Public<select id="apublic"><option value="enfant">Enfant</option><option value="ado" selected>Ado</option><option value="adulte">Adulte</option></select></label><label>Difficulté<select id="adiff"><option value="decouverte">Découverte</option><option value="aventure" selected>Aventure</option><option value="expert">Expert</option></select></label><label>Noms des joueurs<textarea id="anames" placeholder="Un prénom par ligne"></textarea></label></section><button class="primary" onclick="createSession()">Générer la session</button><div id="adminResult"></div><button class="ghost" onclick="go('home')">Retour accueil</button></main>`}
};
function card(m){ const old=S.mission?.id===m.id?' selected':''; return `<button class="missionCard${old}" style="--accent:${m.color}" onclick="selectMission('${m.id}')"><span>${m.emoji}</span><small>${m.title}</small><h3>${m.village}</h3><p>${m.tone}</p><b>Jouer</b></button>`}
function bind(){ $$('[data-public]').forEach(b=>b.onclick=()=>{S.public=b.dataset.public; render()}); $$('[data-diff]').forEach(b=>b.onclick=()=>{S.difficulty=b.dataset.diff; render()}); }
function startMission(){ S.step=0; S.score=0; S.hints=0; go('intro'); }
function activeSteps(){ const base=S.mission.steps; const n=difficultyIndex[S.difficulty]+4; return [...base, ...base, ...base].slice(0,n); }
function speakIntro(){ const txt=`${S.mission.village}. ${S.mission.tone}. Observe, résous les énigmes et avance étape par étape.`; if('speechSynthesis' in window){ speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(txt)); } }
function validateAnswer(){ const fb=$('#feedback'); S.score+=10; fb.innerHTML='<b class="ok">Validé. Étape suivante débloquée.</b>'; setTimeout(nextStep,700); }
function showHint(){ S.hints++; S.score-=5; $('#feedback').innerHTML=`<b class="hint">Indice : ${activeSteps()[S.step].hint}</b>`; }
function skipStep(){ S.score+=2; nextStep(); }
function nextStep(){ if(S.step>=activeSteps().length-1) go('end'); else { S.step++; render(); } }
function restart(){ S.step=0; S.score=0; go('intro'); }
function createSession(){ const players=Number($('#aplayers').value||0), teams=Number($('#ateams').value), names=$('#anames').value.split('\n').map(x=>x.trim()).filter(Boolean); const code=('FAFA'+Math.random().toString(36).slice(2,6)).toUpperCase(); const m=FAFA_MISSIONS.find(x=>x.id===$('#amission').value); const public=$('#apublic').value, diff=$('#adiff').value; const teamList=Array.from({length:teams},(_,i)=>({name:`Équipe ${i+1}`, players:[]})); const pool=names.length?names:Array.from({length:players},(_,i)=>`Joueur ${i+1}`); pool.forEach((p,i)=>teamList[i%teams].players.push(p)); const sess={code, mission:m.id, public, diff, teamList, created:new Date().toISOString()}; const all=LS.get('sessions',{}); all[code]=sess; LS.set('sessions', all); $('#adminResult').innerHTML=`<section class="sessionBox"><h2>Session prête</h2><p>Code joueur : <b>${code}</b></p><div class="teams">${teamList.map(t=>`<article><h3>${t.name}</h3><p>${t.players.join(', ')||'À compléter'}</p></article>`).join('')}</div><h3>Guide réponses administrateur</h3><div class="guide">${m.steps.map((e,i)=>`<b>${i+1}. ${e.place}</b><span>Réponse attendue : ${e.answer}</span>`).join('')}</div></section>`; }
render();
