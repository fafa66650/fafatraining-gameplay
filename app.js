
const APP = document.getElementById('app');
const RAIN = document.getElementById('rain');
const CTX = RAIN.getContext('2d');

const audioFiles = {
  theme_night: './audio/theme_night.wav',
  theme_jungle: './audio/theme_jungle.wav',
  theme_lab: './audio/theme_lab.wav',
  ok: './audio/ok.wav',
  bad: './audio/bad.wav',
  tension: './audio/tension.wav',
  glitch: './audio/glitch.wav'
};
const audioPool = {};
let soundEnabled = false;

function prepareAudio() {
  Object.entries(audioFiles).forEach(([k, v]) => {
    if (!audioPool[k]) {
      const a = new Audio(v);
      a.preload = 'auto';
      a.loop = k.startsWith('theme_');
      a.volume = k.startsWith('theme_') ? 0.55 : 0.95;
      audioPool[k] = a;
    }
  });
}
function currentThemeTrack() {
  return state.theme === 'jungle' ? 'theme_jungle' : state.theme === 'lab' ? 'theme_lab' : 'theme_night';
}
function autoEnableSound() {
  if (state.soundMode === 'off') { soundEnabled = false; save(); return; }
  if (soundEnabled) return;
  soundEnabled = true;
  prepareAudio();
  save();
}
function playFile(name) {
  if (!soundEnabled) return;
  try {
    prepareAudio();
    const a = audioPool[name].cloneNode();
    a.volume = audioPool[name].volume;
    a.play().catch(() => {});
  } catch (e) {}
}
function startThemeMusic() {
  if (!soundEnabled) return;
  try {
    prepareAudio();
    ['theme_night','theme_jungle','theme_lab'].forEach(k => {
      audioPool[k].pause();
      audioPool[k].currentTime = 0;
    });
    const key = currentThemeTrack();
    audioPool[key].currentTime = 0;
    audioPool[key].play().catch(() => {});
  } catch (e) {}
}
function stopThemeMusic() {
  try {
    prepareAudio();
    ['theme_night','theme_jungle','theme_lab'].forEach(k => {
      audioPool[k].pause();
      audioPool[k].currentTime = 0;
    });
  } catch (e) {}
}
function norm(s) {
  return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'').trim();
}

const THEMES = {
  "": {
    body:'theme-night',
    title:'GAME ARENA',
    subtitle:'Une plateforme d’escape game immersive pensée pour le terrain, le téléphone et l’ordinateur. Tu prépares tes équipes, choisis le niveau, règles la durée, puis tu lances une mission vivante avec pression, indices, pièges et retournements.'
  },
  night: {
    body:'theme-night',
    title:'GAME ARENA',
    subtitle:'Une mission urbaine sous pluie et néons, pensée pour la lecture d’indices, la logique et la tension.',
    mission:'Infiltration nocturne. Des indices ont été altérés. Ton équipe doit lire froidement, éviter les fausses pistes et sortir avec le meilleur score.',
    intro:['Transmission instable…','Une infiltration a été confirmée.','Lis vite, mais lis bien.','La nuit favorise les erreurs de lecture.','Mission autorisée.']
  },
  jungle: {
    body:'theme-jungle',
    title:'GAME ARENA',
    subtitle:'Une expédition au cœur de ruines vivantes, entre repères cachés, trajectoires et glyphes.',
    mission:'Une ancienne voie est de nouveau ouverte. Les bons passages se lisent dans l’ordre, la forme et les détails.',
    intro:['La jungle ne se tait jamais complètement.','Les ruines se lisent par couches.','Le bon chemin n’est pas toujours le plus beau.','Expédition ouverte.']
  },
  lab: {
    body:'theme-lab',
    title:'GAME ARENA',
    subtitle:'Un protocole d’urgence dans un environnement instable, où chaque action, chaque lecture et chaque décision comptent.',
    mission:'Le système se dégrade. Ton équipe doit stabiliser, lire, trier et verrouiller le bon chemin avant la rupture.',
    intro:['L’alarme a déjà commencé.','Les écrans se contredisent.','Chaque décision a un coût.','Protocole activé.']
  }
};

const FINALS = {"night": {"prompt": "Quel profil reste la piste finale la plus solide ?", "choices": ["A · Agent noir", "B · Agent blanc", "C · Agent gris", "D · Agent bleu"], "answer": 1}, "jungle": {"prompt": "Quelle dernière piste ouvre vraiment le passage ?", "choices": ["A · Nord", "B · Centre", "C · Est", "D · Ouest"], "answer": 1}, "lab": {"prompt": "Quelle lettre verrouille la sécurité finale ?", "choices": ["A · R", "B · N", "C · I", "D · U"], "answer": 1}};

const BANK = {
  night: [
    {title:"Salle d'interrogatoire fracturée",type:"logic",answerType:"choice",question:"Trois suspects parlent. Un seul dit vrai. A : « B ment. » B : « C ment. » C : « A et B mentent. » Qui dit vrai ?",choices:["A","B","C"],answer:"C",exp:"Si A dit vrai alors B ment, donc C dit vrai aussi : impossible. Si B dit vrai alors contradiction. La seule configuration stable est C seul véridique.",visual:null,visualNeeded:false},
    {title:"Dossier crypté",type:"observation",answerType:"text",question:"Un badge montre 9 / 3 / 6 / 12. Le protocole indique : 'Lis dans le sens horaire puis retire le plus petit au plus grand.' Quel code final obtiens-tu ?",answer:"936",exp:"Lecture horaire 12-3-6-9. La règle retire l'écart principal et conserve la séquence utile 9-3-6.",visual:"night_scene_dossier.png",visualNeeded:true},
    {title:"Transmission brouillée",type:"deduction",answerType:"choice",question:"Le traître n'est ni dans l'équipe rouge, ni dans l'équipe au badge bleu. Rouge = A/B. Bleu = B/C. Qui reste suspect unique ?",choices:["A","B","C"],answer:"C",exp:"A est rouge. B est rouge et bleu. C reste seul suspect valide.",visual:null,visualNeeded:false},
    {title:"Code miroir",type:"pattern",answerType:"text",question:"Trouve le code miroir de 2187 si chaque chiffre devient son opposé sur un clavier 0-9 (0↔9,1↔8,2↔7...).",answer:"7812",exp:"Chaque chiffre est inversé sur l'axe du clavier : 2→7, 1→8, 8→1, 7→2.",visual:"night_puzzle_codewall.png",visualNeeded:true},
    {title:"Recoupement de dossiers",type:"multi",answerType:"choice",question:"Le suspect recherché est arrivé après 22h, n'a pas utilisé le quai nord, et possède un badge noir. Quel dossier correspond ?",choices:["A : 21h / quai nord / badge noir","B : 23h / quai sud / badge noir","C : 23h / quai nord / badge noir"],answer:"B : 23h / quai sud / badge noir",exp:"Seul le dossier B respecte les trois contraintes simultanément.",visual:"night_scene_console.png",visualNeeded:true},
    {title:"Piège narratif",type:"trap",answerType:"choice",question:"Si le protocole est vert, la salle est sûre. La salle n'est pas sûre. Peut-on conclure que le protocole n'est pas vert ?",choices:["Oui","Non"],answer:"Oui",exp:"C'est la contraposée logique : si P implique Q, et non Q, alors non P.",visual:null,visualNeeded:false},
    {title:"Meta Final — Identification du traître",type:"meta",answerType:"choice",question:"En recoupant les réponses précédentes, quel agent correspond au badge noir, au quai sud et au protocole miroir ?",choices:["Agent Voss","Agent Kane","Agent Mercer"],answer:"Agent Kane",exp:"Tous les indices accumulés convergent vers l'agent Kane.",visual:"night_scene_dossier.png",visualNeeded:true}
  ],
  jungle: [],
  lab: []
};


let state = {
  theme:'',
  totalPlayers:'',
  teamCount:'',
  publicType:'',
  difficulty:'',
  duration:'',
  teams:[],
  activeTeam:0,
  hints:0,
  time:0,
  index:0,
  picked:null,
  attempts:0,
  selectedChallenges:[],
  fragments:[],
  timerActive:false,
  metaPick:null,
  showVisual:true,
  soundMode:'on'
};

function save() {
  localStorage.setItem('fafa_v12', JSON.stringify({...state, soundEnabled}));
}
function load() {
  try {
    const raw = localStorage.getItem('fafa_v12');
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed);
      soundEnabled = !!parsed.soundEnabled;
    }
  } catch (e) {}
}
function clearStore() {
  localStorage.removeItem('fafa_v12');
}
function setTheme() {
  document.body.className = THEMES[state.theme || ''].body;
}
function currentTeam() {
  return state.teams[state.activeTeam] || {name:'Équipe', players:[], score:0, progress:0};
}
function currentPlayer() {
  const t = currentTeam();
  if (!t.players.length) return t.name || 'Équipe';
  return t.players[state.index % t.players.length] || t.name;
}
function fmt(t) {
  const m=String(Math.floor(t/60)).padStart(2,'0');
  const s=String(t%60).padStart(2,'0');
  return `${m}:${s}`;
}
function timerColor() {
  if (state.time > 120) return 'green';
  if (state.time > 45) return 'orange';
  return 'red';
}
function syncTimerBadge() {
  const el = document.getElementById('live-timer');
  if (!el) return;
  el.textContent = '⏱ ' + fmt(state.time);
  el.className = 'badge timer timer-live ' + timerColor();
}

function ready() {
  return state.theme && state.totalPlayers && state.teamCount && state.publicType && state.difficulty && state.duration;
}
function difficultyWeight() {
  return {facile:1,moyen:2,difficile:3,extreme:4}[state.difficulty] || 1;
}
function challengeCount() {
  const minutes = Number(state.duration||0)/60;
  let base = minutes<=30 ? 4 : minutes<=45 ? 6 : minutes<=60 ? 8 : minutes<=90 ? 10 : 12;
  if (state.publicType === 'enfants') base -= 1;
  if (state.publicType === 'adultes') base += 1;
  base += Math.max(0, difficultyWeight()-2);
  if ((Number(state.totalPlayers)||0) >= 24) base += 1;
  if ((Number(state.teamCount)||0) >= 5) base += 1;
  return Math.max(4, Math.min(16, base));
}
function autoDistribution() {
  if (!state.totalPlayers || !state.teamCount) return 'à définir';
  const total=Number(state.totalPlayers), teams=Number(state.teamCount);
  const base=Math.floor(total/teams), rest=total%teams;
  return rest===0 ? `${teams} équipes de ${base}` : `${rest} équipes de ${base+1} · ${teams-rest} équipes de ${base}`;
}
function poolForCurrent() {
  if (!ready()) return [];
  const age = state.publicType;
  const maxLevel = difficultyWeight();
  return (BANK[state.theme] || []).filter(x => x.age === age && x.level <= maxLevel);
}
function chooseChallenges() {
  const pool = poolForCurrent();
  const count = challengeCount();
  const out = [];
  let i = 0;
  while (out.length < count && pool.length) {
    const src = pool[i % pool.length];
    out.push({...src, instance:i+1});
    i++;
  }
  return out;
}

function renderAdmin() {
  setTheme();
  const theme = THEMES[state.theme || ''];
  APP.innerHTML = `
    <div class="hero">
      <div><img src="./assets/logo.png" class="hero-logo" alt="logo"></div>
      <div>
        <div class="kicker">FAFATRAINING</div>
        <h1>${theme.title}</h1>
        <div class="subtitle">${theme.subtitle}</div>
        <div class="notice"><strong>Ce que tu prépares ici :</strong><br>une expérience d’escape game numérique pensée comme un vrai jeu d’évasion : équipes, rotation des joueurs, ambiance, pression, indices, pièges et montée en intensité jusqu’au final.</div>
        ${state.theme ? `<div class="notice"><strong>Mission choisie :</strong><br>${THEMES[state.theme].mission}</div>` : ''}
      </div>
      <div class="stats">
        <div class="stat a"><strong>${state.teamCount || '—'}</strong><span>équipes</span></div>
        <div class="stat b"><strong>${state.totalPlayers || '—'}</strong><span>joueurs</span></div>
        <div class="stat c"><strong>${state.difficulty || '—'}</strong><span>difficulté</span></div>
        <div class="stat d"><strong>${state.duration ? Number(state.duration)/60+' min' : '—'}</strong><span>durée</span></div>
      </div>
    </div>

    <section class="panel">
      <h2>Administration de mission</h2>
      <div class="grid4">
        <div><label>Thème</label><select id="theme">
          <option value="">Choisir</option>
          <option value="night" ${state.theme==='night'?'selected':''}>Night Protocol</option>
          <option value="jungle" ${state.theme==='jungle'?'selected':''}>Expédition interdite</option>
          <option value="lab" ${state.theme==='lab'?'selected':''}>Zone 13</option>
        </select></div>
        <div><label>Nombre total de joueurs</label><input id="totalPlayers" type="number" min="2" placeholder="Ex : 22" value="${state.totalPlayers || ''}"></div>
        <div><label>Nombre d’équipes</label><select id="teamCount">
          <option value="">Choisir</option>
          ${[2,3,4,5,6].map(n=>`<option value="${n}" ${String(state.teamCount)===String(n)?'selected':''}>${n} équipes</option>`).join('')}
        </select></div>
        <div><label>Type de public</label><select id="publicType">
          <option value="">Choisir</option>
          <option value="enfants" ${state.publicType==='enfants'?'selected':''}>Enfants</option>
          <option value="ados" ${state.publicType==='ados'?'selected':''}>Ados</option>
          <option value="adultes" ${state.publicType==='adultes'?'selected':''}>Adultes</option>
        </select></div>
      </div>
      <div class="grid3" style="margin-top:14px">
        <div><label>Difficulté</label><select id="difficulty">
          <option value="">Choisir</option>
          <option value="facile" ${state.difficulty==='facile'?'selected':''}>Facile</option>
          <option value="moyen" ${state.difficulty==='moyen'?'selected':''}>Moyen</option>
          <option value="difficile" ${state.difficulty==='difficile'?'selected':''}>Difficile</option>
          <option value="extreme" ${state.difficulty==='extreme'?'selected':''}>Extrême</option>
        </select></div>
        <div><label>Durée</label><select id="duration">
          <option value="">Choisir</option>
          <option value="1800" ${String(state.duration)==='1800'?'selected':''}>30 min</option>
          <option value="2700" ${String(state.duration)==='2700'?'selected':''}>45 min</option>
          <option value="3600" ${String(state.duration)==='3600'?'selected':''}>60 min</option>
          <option value="5400" ${String(state.duration)==='5400'?'selected':''}>90 min</option>
          <option value="7200" ${String(state.duration)==='7200'?'selected':''}>120 min</option>
        </select></div>
        <div><label>Nombre d’épreuves auto</label><input disabled value="${ready() ? challengeCount() + ' épreuves + final' : 'à définir'}"></div>
      </div>
      <div class="grid2" style="margin-top:14px">
        <div><label>Son</label><select id="soundMode"><option value="on" ${state.soundMode==='on'?'selected':''}>Activé automatiquement</option><option value="off" ${state.soundMode==='off'?'selected':''}>Coupé</option></select></div>
        <div><label>Mode image d’indice</label><input disabled value="affichée seulement quand elle sert vraiment"></div>
      </div>

      <div class="summary-grid" style="margin-top:14px">
        <div class="card"><h4>Répartition auto</h4><div>${autoDistribution()}</div></div>
        <div class="card"><h4>Niveau attendu</h4><div>${state.difficulty || 'à définir'}</div></div>
        <div class="card"><h4>Variété disponible</h4><div>${ready() ? `${poolForCurrent().length} modèles pour ce réglage` : 'à définir'}</div></div>
        <div class="card"><h4>Musique</h4><div>${state.soundMode==='off' ? 'coupée' : 'activée au lancement'}</div></div>
      </div>

      <div class="btns">
        <button class="btn-main" onclick="generateTeamsFromForm()">GÉNÉRER LES ÉQUIPES</button>
        <button class="btn-alt" onclick="resetAll()">RÉINITIALISER</button>
      </div>
      <div id="teamsEditor"></div>
    </section>`;
}

function readAdminForm() {
  state.theme = document.getElementById('theme').value;
  state.totalPlayers = document.getElementById('totalPlayers').value;
  state.teamCount = document.getElementById('teamCount').value;
  state.publicType = document.getElementById('publicType').value;
  state.difficulty = document.getElementById('difficulty').value;
  state.duration = document.getElementById('duration').value;
  state.soundMode = document.getElementById('soundMode').value;
  save();
}
function generateTeamsFromForm() {
  readAdminForm();
  if (!ready()) {
    alert('Remplis d’abord le thème, le nombre de joueurs, le nombre d’équipes, le public, la difficulté et la durée.');
    return;
  }
  const total = Number(state.totalPlayers), teams = Number(state.teamCount), suggested = Math.ceil(total/teams);
  state.teams = Array.from({length:teams}, (_,i)=>({name:`Équipe ${i+1}`, players:Array.from({length:suggested}, ()=>''), score:0, progress:0}));
  save();
  renderAdmin();
  document.getElementById('teamsEditor').innerHTML = `
    <div class="notice"><strong>Répartition cible :</strong> ${autoDistribution()}</div>
    <div class="team-grid">
      ${state.teams.map((team,i)=>`
        <div class="team-card">
          <h4>Équipe ${i+1}</h4>
          <label>Nom d’équipe</label>
          <input id="teamName_${i}" value="${team.name}">
          <label style="margin-top:8px">Joueurs (un par ligne)</label>
          <textarea id="teamPlayers_${i}" placeholder="Nom 1&#10;Nom 2&#10;Nom 3">${team.players.join('\n')}</textarea>
          <div class="notice"><strong>Lien équipe</strong><code>${location.origin}${location.pathname}#team-${i}</code></div>
        </div>`).join('')}
    </div>
    <div class="btns"><button class="btn-main" onclick="launchMission()">LANCER LA MISSION</button></div>`;
}
function launchMission() {
  if (!state.teams.length) { alert('Génère d’abord les équipes.'); return; }
  autoEnableSound();
  state.teams = state.teams.map((team,i)=>({
    name: document.getElementById(`teamName_${i}`)?.value?.trim() || `Équipe ${i+1}`,
    players: (document.getElementById(`teamPlayers_${i}`)?.value || '').split('\n').map(x=>x.trim()).filter(Boolean),
    score:0, progress:0
  }));
  state.hints=0; state.time=Number(state.duration); state.index=0; state.activeTeam=0; state.fragments=[]; state.metaPick=null; state.selectedChallenges=chooseChallenges(); state.timerActive=false; state.picked=null; state.attempts=0; state.showVisual=true;
  save();
  location.hash='#admin-intro';
  renderRoute();
}

function showIntro(isPlayer=false) {
  const theme = THEMES[state.theme];
  playFile('glitch');
  APP.innerHTML = `<section class="cinematic"><div class="cinematic-box"><div class="kicker">OUVERTURE CINÉMATIQUE</div><h1>ACCÈS MISSION</h1><div class="notice"><strong>Brief de mission :</strong><br>${theme.mission}</div><div class="notice"><strong>Important :</strong><br>le chrono part dès que tu entres dans la première épreuve. Lis vite, répartis les rôles, et garde tes aides pour les vrais blocages.</div><div id="cineBox"></div><div class="btns"><button class="btn-main hidden" id="introBtn" onclick="${isPlayer ? 'goPlayer()' : 'goAdmin()'}">ENTRER DANS LA PREMIÈRE ÉPREUVE</button></div></div></section>`;
  let i=0; const box=document.getElementById('cineBox');
  function step() {
    if (i < theme.intro.length) {
      box.innerHTML += `<div class="cine-line fadein">${theme.intro[i]}</div>`;
      playFile('glitch');
      i++;
      setTimeout(step, 900);
    } else {
      document.getElementById('introBtn').classList.remove('hidden');
    }
  }
  step();
}

function startTicking() {
  if (state.timerActive) return;
  state.timerActive = true;
  save();
  startThemeMusic();
  syncTimerBadge();
  const tick = () => {
    const raw = localStorage.getItem('fafa_v12');
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed);
      soundEnabled = !!parsed.soundEnabled;
    }
    if (!state.timerActive) return;
    state.time = Math.max(0, Number(state.time) - 1);
    if (state.time === 45 || state.time === 30 || state.time === 15) playFile('tension');
    save();
    syncTimerBadge();
    if (state.time <= 0) {
      state.timerActive = false;
      save();
      finishMission(true);
      return;
    }
    setTimeout(tick, 1000);
  };
  setTimeout(tick, 1000);
}
function goAdmin() { startTicking(); renderAdminPlay(); }
function goPlayer() { startTicking(); renderPlayer(); }

function randomEvent() {
  if (Math.random() < 0.24) {
    const events = [
      {txt:'🎁 BONUS : +100 points à l’équipe active', fn:()=>currentTeam().score += 100},
      {txt:'💣 SABOTAGE : -80 points à l’équipe active', fn:()=>currentTeam().score = Math.max(0, currentTeam().score - 80)},
      {txt:'⏱ FAILLE TEMPORELLE : -15 secondes', fn:()=>state.time = Math.max(0, state.time - 15)},
      {txt:'⚠️ FAUX INDICE : cette manche contient une évidence piégée', fn:()=>{}},
    ];
    const ev = events[Math.floor(Math.random()*events.length)];
    ev.fn(); return ev.txt;
  }
  return '';
}
function renderAdminMonitor() {
  return `<div class="monitor-card">
    <h3>Suivi administrateur</h3>
    ${state.teams.map((team,idx)=>`<div class="monitor-team" style="${idx===state.activeTeam?'box-shadow:0 0 0 2px rgba(123,210,255,.28) inset;':''}"><strong>${team.name}</strong><br>Score : ${team.score} pts<br>Progression : ${team.progress}/${state.selectedChallenges.length}<br>Joueurs : ${team.players.length}</div>`).join('')}
    <div class="btns"><button class="btn-dark" onclick="adminBoost()">+100 équipe active</button><button class="btn-dark" onclick="adminHint()">Indice admin</button></div>
    <div id="adminMsg"></div>
  </div>`;
}
function adminBoost() { currentTeam().score += 100; save(); renderAdminPlay(); }
function adminHint() { const c=state.selectedChallenges[state.index]; document.getElementById('adminMsg').innerHTML = `<div class="freeclue"><strong>Indice admin :</strong><br>${c.free}</div>`; }
function visualBlock(c) {
  if(!c.visual || !c.visualNeeded || !state.showVisual) return '';
  return `<div class="visual small"><img src="./assets/${c.visual}" alt="${c.visual}"><div class="challenge-sub">Indice visuel utile pour résoudre cette épreuve</div></div>`;
}
function renderChallenge(showAdmin) {
  const c = state.selectedChallenges[state.index];
  const event = showAdmin ? randomEvent() : '';
  const main = `
    <section class="game-shell fadein">
      <div class="hud">
        <div class="hud-left">
          <div class="badge points">${currentTeam().name} · ${currentTeam().score} pts</div>
          <div class="badge meta">Épreuve ${state.index+1}/${state.selectedChallenges.length}</div>
          <div class="badge meta">${c.label}</div>
        </div>
        <div class="hud-right"><div id="live-timer" class="badge timer timer-live ${timerColor()}">⏱ ${fmt(state.time)}</div></div>
      </div>
      ${event?`<div class="eventbox">${event}</div>`:''}
      <div class="turn">🔥 C’EST À : ${currentPlayer()} DE JOUER</div>
      <div class="rules"><strong>Règle :</strong> lis la scène, réponds, puis utilise une aide seulement si nécessaire.</div>
      <div class="story">${c.scene}</div>
      <div class="help-floating"><button class="help-pill help-aide" onclick="useHint(1)">AIDE</button><button class="help-pill help-bonus" onclick="useHint(2)">BONUS</button><button class="help-pill help-info" onclick="showFree()">INDICE</button></div>
      <h2 class="challenge-title">${c.title}</h2>
      <div class="challenge-sub">Type d’épreuve : ${c.label}</div>
      ${c.visual && c.visualNeeded ? `<div class="visual-toggle"><button class="btn-alt" onclick="toggleVisual()">${state.showVisual ? 'MASQUER L’INDICE VISUEL' : 'AFFICHER L’INDICE VISUEL'}</button></div>` : ''}
      ${visualBlock(c)}
      <div class="story"><strong>Énigme :</strong><br>${c.prompt.replace(/\n/g,'<br>')}</div>
      <div id="freeSlot"></div>
      ${c.answerType==='choice'
        ? `<div class="choice-grid">${c.choices.map((choice,i)=>`<button class="choice" onclick="pick(${i}, this)">${choice}</button>`).join('')}</div>`
        : `<div class="panel" style="padding:14px;margin-top:14px"><label>Réponse libre</label><input id="freeAnswer" placeholder="Entre ta réponse"></div>`}
      <div id="feedback"></div>
    </section>`;
  const aside = showAdmin === true ? renderAdminMonitor() : '';
  APP.innerHTML = `<div class="game-layout">${main}${aside}</div><div class="validate-bar"><button class="validate-btn" onclick="validate(${showAdmin})">VALIDER LA RÉPONSE</button></div>`;
  if(!showAdmin){ const monitor = document.querySelector('.monitor-card'); if(monitor) monitor.remove(); }
  syncTimerBadge();
}
function renderAdminPlay() { if (state.index >= state.selectedChallenges.length) { renderFinal(true); return; } renderChallenge(true); }
function renderPlayer() { if (state.index >= state.selectedChallenges.length) { renderFinal(false); return; } renderChallenge(false); }
function toggleVisual() { state.showVisual = !state.showVisual; save(); location.hash === '#admin-play' ? renderAdminPlay() : renderPlayer(); }
function pick(i,el) { document.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected')); el.classList.add('selected'); state.picked=i; }
function showFree() { const c=state.selectedChallenges[state.index]; document.getElementById('freeSlot').innerHTML = `<div class="freeclue"><strong>Indice discret :</strong><br>${c.free}</div>`; }
function useHint(level) {
  const c=state.selectedChallenges[state.index];
  state.hints++;
  currentTeam().score = Math.max(0, currentTeam().score - (level===1 ? 40 : 90));
  document.getElementById('feedback').innerHTML = `<div class="feedback help"><strong>${level===1 ? 'Carte aide' : 'Carte bonus'}</strong><br>${level===1 ? c.h1 : c.h2}</div>`;
  save();
}
function isValid(c, val) {
  if (c.validatorType === 'equals') return norm(val) === c.validatorValue;
  if (c.validatorType === 'in') return c.validatorValue.includes(norm(val));
  if (c.validatorType === 'containsAny') return c.validatorValue.some(x=>norm(val).includes(x));
  return false;
}
function applyBranchSuccess(c, answer) {
  if (c.branchMap && c.branchMap[answer]) {
    const fx = c.branchMap[answer];
    if (fx.score) currentTeam().score += fx.score;
    if (fx.time) state.time = Math.max(0, state.time + fx.time);
  }
  if (c.branchSuccess) {
    if (c.branchSuccess.score) currentTeam().score += c.branchSuccess.score;
    if (c.branchSuccess.time) state.time = Math.max(0, state.time + c.branchSuccess.time);
  }
}
function applyBranchFail(c) {
  if (c.branchFail) {
    if (c.branchFail.score) currentTeam().score += c.branchFail.score;
    if (c.branchFail.time) state.time = Math.max(0, state.time + c.branchFail.time);
  }
}
function validate(showAdmin) {
  const c = state.selectedChallenges[state.index];
  let ok = false;
  let answer = '';
  if (c.answerType === 'choice') {
    if (state.picked === null) {
      document.getElementById('feedback').innerHTML = `<div class="feedback bad">Choisis d’abord une réponse.</div>`;
      return;
    }
    ok = state.picked === c.answerIndex;
    answer = norm(c.choices[state.picked].split('·').pop());
  } else {
    const val = document.getElementById('freeAnswer').value;
    ok = isValid(c, val);
    answer = norm(val);
  }
  const shell = document.querySelector('.game-shell');
  if (ok) {
    currentTeam().score += 120;
    currentTeam().progress = Math.max(currentTeam().progress, state.index+1);
    state.fragments.push(c.fragment);
    applyBranchSuccess(c, answer);
    playFile('ok');
    shell.classList.remove('flash-bad'); shell.classList.add('flash-good');
    document.getElementById('feedback').innerHTML = `<div class="feedback ok"><strong>✅ Bonne réponse.</strong><br><strong>Explication :</strong> ${c.exp}${c.branchMap||c.branchSuccess?'<br><br><strong>Effet d’embranchement appliqué.</strong>':''}<br><br><strong>Fragment obtenu :</strong> ${c.fragment}</div><div class="btns"><button class="btn-main" onclick="nextChallenge(${showAdmin})">ÉPREUVE SUIVANTE</button></div>`;
  } else {
    state.attempts++;
    playFile('bad');
    shell.classList.remove('flash-good'); shell.classList.add('flash-bad');
    if (state.attempts < 2) {
      currentTeam().score = Math.max(0, currentTeam().score - 40);
      document.getElementById('feedback').innerHTML = `<div class="feedback bad"><strong>❌ Mauvaise piste.</strong><br>Tu peux corriger et répondre une seconde fois avant la sanction finale.<br><br><span class="small">Pénalité : -40 points.</span></div>`;
    } else {
      currentTeam().score = Math.max(0, currentTeam().score - 80);
      applyBranchFail(c);
      document.getElementById('feedback').innerHTML = `<div class="feedback bad"><strong>💥 Défi perdu.</strong><br>${c.exp}${c.branchFail?'<br><br><strong>Effet d’embranchement défavorable appliqué.</strong>':''}</div><div class="btns"><button class="btn-main" onclick="nextChallenge(${showAdmin})">ÉPREUVE SUIVANTE</button></div>`;
    }
  }
  save();
}
function nextChallenge(showAdmin) {
  currentTeam().progress = Math.max(currentTeam().progress, state.index+1);
  state.index++;
  state.activeTeam = (state.activeTeam + 1) % state.teams.length;
  state.attempts = 0;
  state.picked = null;
  save();
  showAdmin ? renderAdminPlay() : renderPlayer();
}
function renderFinal(showAdmin) {
  const f = FINALS[state.theme];
  const main = `
    <section class="game-shell fadein">
      <div class="hud"><div class="hud-left"><div class="badge points">Final de mission</div><div class="badge meta">Fragments : ${state.fragments.length}</div></div><div class="hud-right"><div id="live-timer" class="badge timer timer-live ${timerColor()}">⏱ ${fmt(state.time)}</div></div></div>
      <div class="turn">💣 RÉVÉLATION FINALE</div>
      <div class="story">Fragments récupérés : <strong>${state.fragments.join(' · ')||'aucun'}</strong></div>
      <div class="story"><strong>${f.prompt}</strong></div>
      <div class="choice-grid">${f.choices.map((choice,i)=>`<button class="choice" onclick="pickMeta(${i}, this)">${choice}</button>`).join('')}</div>
      <div id="feedback"></div>
    </section>`;
  const aside = showAdmin === true ? renderAdminMonitor() : '';
  APP.innerHTML = `<div class="game-layout">${main}${aside}</div><div class="validate-bar"><button class="validate-btn" onclick="validateMeta()">VALIDER LE VERDICT FINAL</button></div>`;
  if(!showAdmin){ const monitor = document.querySelector('.monitor-card'); if(monitor) monitor.remove(); }
  syncTimerBadge();
}
function pickMeta(i,el) { document.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected')); el.classList.add('selected'); state.metaPick=i; }
function validateMeta() {
  const f = FINALS[state.theme];
  if (state.metaPick === null) {
    document.getElementById('feedback').innerHTML = `<div class="feedback bad">Choisis d’abord une piste.</div>`;
    return;
  }
  if (state.metaPick === f.answer) {
    currentTeam().score += 180;
    playFile('ok');
    document.getElementById('feedback').innerHTML = `<div class="feedback ok"><strong>✅ Verdict validé.</strong><br>La piste finale retenue est la plus solide.</div><div class="btns"><button class="btn-main" onclick="finishMission(false)">CLÔTURER LA MISSION</button></div>`;
  } else {
    currentTeam().score = Math.max(0, currentTeam().score - 120);
    playFile('bad');
    document.getElementById('feedback').innerHTML = `<div class="feedback bad"><strong>❌ Verdict erroné.</strong><br>La mission peut quand même être clôturée avec le score actuel.</div><div class="btns"><button class="btn-main" onclick="finishMission(false)">CLÔTURER LA MISSION</button></div>`;
  }
  save();
}
function finishMission(timeout) {
  stopThemeMusic();
  state.timerActive = false;
  save();
  const ranking = [...state.teams].sort((a,b)=>b.score-a.score);
  APP.innerHTML = `
    <section class="panel"><div class="wow-banner"><div class="wow-title">MISSION FERMÉE</div><div class="small">${state.theme==='night'?'Night Protocol':state.theme==='jungle'?'Expédition interdite':'Zone 13'}</div></div></section>
    <section class="final-card">
      <div class="big-score">${ranking[0]?.score || 0} pts</div>
      <p><strong>${ranking[0]?.name || 'Aucune équipe'}</strong> remporte la mission.</p>
      <p>${timeout ? 'Le chrono a forcé la fermeture de la partie.' : 'La mission se termine avec une vraie sensation de fin, un classement clair et une ambiance plus nette.'}</p>
      <div class="preview-grid" style="margin-top:14px">${ranking.map((team,idx)=>`<div class="card"><h4>${idx+1}. ${team.name}</h4>Score : ${team.score} pts<br>Progression : ${team.progress}/${state.selectedChallenges.length}<br>Joueurs : ${team.players.filter(Boolean).length}</div>`).join('')}</div>
      <div class="btns"><button class="btn-main" onclick="resetAll()">RETOUR ACCUEIL</button></div>
    </section>`;
}
function resetAll() {
  clearStore();
  soundEnabled = false;
  state = {theme:'', totalPlayers:'', teamCount:'', publicType:'', difficulty:'', duration:'', teams:[], activeTeam:0, hints:0, time:0, index:0, picked:null, attempts:0, selectedChallenges:[], fragments:[], timerActive:false, metaPick:null, showVisual:true};
  location.hash = '#admin';
  renderRoute();
}
function renderRoute() {
  load();
  setTheme();
  const r = location.hash || '#admin';
  if (r.startsWith('#team-')) {
    if (!state.selectedChallenges.length) { renderAdmin(); return; }
    showIntro(true); return;
  }
  if (r === '#admin-intro') { showIntro(false); return; }
  if (r === '#admin-play') {
    if (!state.selectedChallenges.length) { renderAdmin(); return; }
    renderAdminPlay(); return;
  }
  renderAdmin();
}

function resizeRain() {
  RAIN.width = innerWidth; RAIN.height = innerHeight;
}
let drops = [];
function initRain() {
  resizeRain();
  drops = Array.from({length:180}, ()=>({x:Math.random()*RAIN.width, y:Math.random()*RAIN.height, l:10+Math.random()*18, v:6+Math.random()*8}));
}
function drawRain() {
  CTX.clearRect(0,0,RAIN.width,RAIN.height);
  CTX.strokeStyle='rgba(114,204,255,.35)';
  CTX.lineWidth=1;
  CTX.beginPath();
  for (const d of drops) {
    CTX.moveTo(d.x,d.y);
    CTX.lineTo(d.x-4,d.y+d.l);
    d.y += d.v; d.x -= .6;
    if (d.y>RAIN.height || d.x<-20) { d.x=Math.random()*RAIN.width+40; d.y=-20; }
  }
  CTX.stroke();
  requestAnimationFrame(drawRain);
}

window.addEventListener('hashchange', renderRoute);
window.addEventListener('resize', resizeRain);
initRain();
drawRain();
renderRoute();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', ()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
