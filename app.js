
const APP = document.getElementById('app');
const RAIN = document.getElementById('rain');
const CTX = RAIN.getContext('2d');

const BANK = {"night": [{"id": "n_hotspot", "label": "Fouille d’image", "type": "image_hotspot", "title": "Bureau sous surveillance", "scene": "Une seule zone de l’image cache le document utile.", "prompt": "Clique directement sur la bonne zone dans l’image.", "visual": "night_scene_dossier.png", "hotspots": [{"id": "window", "label": "Fenêtre", "x": 8, "y": 10, "w": 25, "h": 16}, {"id": "desk", "label": "Bureau", "x": 42, "y": 10, "w": 40, "h": 16}, {"id": "folder", "label": "Dossier central", "x": 18, "y": 38, "w": 56, "h": 28}], "answer": "folder", "exp": "Le dossier central est la seule zone cohérente avec l’objectif de fouille.", "reward": "badge_key", "fragment": "A"}, {"id": "n_drag", "label": "Drag & Drop", "type": "drag_slots", "title": "Classement des badges", "scene": "Les badges doivent être replacés dans l’ordre de priorité.", "prompt": "Fais glisser les badges dans les 4 emplacements, du plus petit au plus grand.", "visual": "night_puzzle_badges.png", "tokens": ["11", "03", "14", "07"], "answer": ["03", "07", "11", "14"], "exp": "Le protocole exigeait un ordre croissant strict : 03, 07, 11, 14.", "reward": "cipher_disk", "fragment": "B"}, {"id": "n_inventory", "label": "Inventaire multi-étapes", "type": "inventory_steps", "title": "Ouverture du dossier chiffré", "scene": "Le dossier final ne s’ouvre qu’en suivant la bonne séquence d’objets.", "prompt": "Utilise d’abord le Badge-clé, puis le Disque chiffré.", "visual": "night_scene_console.png", "steps": ["badge_key", "cipher_disk"], "exp": "Le badge ouvre le compartiment, puis le disque permet le décodage interne.", "reward": "decoded_file", "fragment": "C"}, {"id": "n_lock", "label": "Cadenas numérique", "type": "lock_code", "title": "Verrou 4 chiffres", "scene": "Le code se lit dans le miroir numérique : 2↔7, 1↔8, 8↔1, 7↔2.", "prompt": "Entre le bon code final.", "visual": "night_puzzle_codewall.png", "answer": "7812", "length": 4, "exp": "Le miroir du clavier donne 2→7, 1→8, 8→1, 7→2, soit 7812.", "reward": "kan_segment", "fragment": "D"}, {"id": "n_circuit", "label": "Circuit / Hacking", "type": "circuit_toggle", "title": "Routage sécurisé", "scene": "Active exactement les bons nœuds pour former un chemin sûr.", "prompt": "Active A, C et D seulement.", "visual": "night_puzzle_grid.png", "nodes": ["A", "B", "C", "D"], "answer": ["A", "C", "D"], "exp": "B doit rester coupé, sinon le chemin traverse une zone rouge. A, C et D suffisent.", "reward": "route_map", "fragment": "E"}, {"id": "n_boss", "label": "Boss multi-phases", "type": "boss_multi", "title": "Révélation finale • Dossier classifié", "scene": "Phase 1 : identifie le bon agent. Phase 2 : entre le mot-clé construit pendant la mission.", "prompt": "Résous les deux phases pour fermer la mission.", "visual": "night_scene_console.png", "phase1": {"question": "Quel agent est visé par tous les indices ?", "choices": ["Agent Voss", "Agent Kane", "Agent Mercer"], "answer": "Agent Kane"}, "phase2": {"question": "Entre le mot-clé final.", "answer": "KAN", "mode": "text"}, "exp": "Les indices visuels, le dossier décodé et le segment KAN convergent tous vers l’agent Kane.", "fragment": "F"}], "jungle": [{"id": "j_hotspot", "label": "Fouille d’image", "type": "image_hotspot", "title": "Ruines anciennes", "scene": "Une seule zone de l’image contient le glyphe central.", "prompt": "Clique sur la bonne zone dans l’image.", "visual": "jungle_scene_ruins.png", "hotspots": [{"id": "pillar", "label": "Pilier", "x": 8, "y": 12, "w": 22, "h": 54}, {"id": "altar", "label": "Autel", "x": 36, "y": 30, "w": 30, "h": 26}, {"id": "vines", "label": "Lianes", "x": 70, "y": 15, "w": 18, "h": 44}], "answer": "altar", "exp": "L’autel central est le point rituel logique pour cacher le glyphe principal.", "reward": "glyph_piece", "fragment": "A"}, {"id": "j_drag", "label": "Drag & Drop", "type": "drag_slots", "title": "Ordre des totems", "scene": "Le rituel suit un ordre précis.", "prompt": "Glisse les totems dans l’ordre : Terre, Eau, Feuille, Soleil.", "visual": "jungle_puzzle_path.png", "tokens": ["Soleil", "Feuille", "Terre", "Eau"], "answer": ["Terre", "Eau", "Feuille", "Soleil"], "exp": "Le rituel part de la Terre, traverse l’Eau, monte vers la Feuille et finit sous le Soleil.", "reward": "totem_order", "fragment": "B"}, {"id": "j_inventory", "label": "Inventaire multi-étapes", "type": "inventory_steps", "title": "Socle du sanctuaire", "scene": "Le socle s’ouvre avec deux objets dans le bon ordre.", "prompt": "Utilise d’abord l’Ordre des totems, puis le Fragment de glyphe.", "visual": "jungle_puzzle_tablet.png", "steps": ["totem_order", "glyph_piece"], "exp": "Le socle vérifie d’abord la séquence rituelle, puis le glyphe d’accès.", "reward": "ritual_key", "fragment": "C"}, {"id": "j_lock", "label": "Tablette à glyphes", "type": "lock_code", "title": "Mot d’ouverture", "scene": "La tablette demande un mot court découvert dans les ruines.", "prompt": "Entre le mot d’ouverture.", "visual": "jungle_puzzle_glyphs.png", "answer": "RUNE", "length": 4, "exp": "Le mot RUNE est la seule lecture cohérente issue des symboles révélés.", "reward": "rune_word", "fragment": "D"}, {"id": "j_combine", "label": "Combinaison d’objets", "type": "combine_items", "title": "Assemblage rituel", "scene": "Deux objets seulement forment la clé du temple.", "prompt": "Sélectionne les deux bons objets puis combine-les.", "visual": "jungle_scene_map.png", "need": ["ritual_key", "rune_word"], "exp": "La clé rituelle et le mot RUNE créent l’ouverture complète du temple.", "reward": "temple_key", "fragment": "E"}, {"id": "j_boss", "label": "Boss multi-phases", "type": "boss_multi", "title": "Portail du temple", "scene": "Phase 1 : choisis le bon mot. Phase 2 : valide l’objet final.", "prompt": "Résous les deux phases pour franchir le portail.", "visual": "jungle_scene_intro.png", "phase1": {"question": "Quel mot ouvre vraiment le portail ?", "choices": ["RUNE", "TEMPLE", "TOTEM"], "answer": "RUNE"}, "phase2": {"question": "Quel objet valide le rituel ?", "answer": "temple_key", "mode": "inventory"}, "exp": "Le portail exige le mot RUNE et la clé du temple assemblée pendant la mission.", "fragment": "F"}], "lab": [{"id": "l_hotspot", "label": "Fouille d’image", "type": "image_hotspot", "title": "Terminal de maintenance", "scene": "Une seule zone du terminal contient le code de service.", "prompt": "Clique sur la bonne zone dans l’image.", "visual": "lab_scene_report.png", "hotspots": [{"id": "corner", "label": "Coin supérieur", "x": 10, "y": 10, "w": 24, "h": 16}, {"id": "panel", "label": "Panneau central", "x": 28, "y": 34, "w": 45, "h": 30}, {"id": "alert", "label": "Voyant rouge", "x": 76, "y": 16, "w": 14, "h": 16}], "answer": "panel", "exp": "Le panneau central est l’emplacement logique des données système utiles.", "reward": "code_slice", "fragment": "A"}, {"id": "l_drag", "label": "Drag & Drop", "type": "drag_slots", "title": "Assemblage de circuit", "scene": "Le flux doit être rétabli dans le bon ordre.", "prompt": "Glisse les modules dans l’ordre : Source, Filtre, Noyau, Sortie.", "visual": "lab_scene_circuit.png", "tokens": ["Noyau", "Sortie", "Source", "Filtre"], "answer": ["Source", "Filtre", "Noyau", "Sortie"], "exp": "Un circuit stable suit : Source, Filtre, Noyau, Sortie.", "reward": "circuit_map", "fragment": "B"}, {"id": "l_inventory", "label": "Inventaire multi-étapes", "type": "inventory_steps", "title": "Port de service", "scene": "Le port demande deux validations successives.", "prompt": "Utilise d’abord le Plan de circuit, puis la Tranche de code.", "visual": "lab_puzzle_lock.png", "steps": ["circuit_map", "code_slice"], "exp": "Le port exige d’abord la topologie du circuit puis le code de maintenance.", "reward": "service_access", "fragment": "C"}, {"id": "l_lock", "label": "Verrou à roues", "type": "lock_code", "title": "Mot de stabilisation", "scene": "Le verrou final demande le mot reconstruit par le système.", "prompt": "Entre le mot final.", "visual": "lab_puzzle_matrix.png", "answer": "SAFE", "length": 4, "exp": "SAFE est le mot de stabilisation présent dans le rapport d’alarme.", "reward": "safe_word", "fragment": "D"}, {"id": "l_circuit", "label": "Circuit dédié", "type": "circuit_toggle", "title": "Nœuds de confinement", "scene": "Pour contenir la surcharge, active exactement B, C et E.", "prompt": "Active les bons nœuds et laisse les autres éteints.", "visual": "lab_puzzle_alert.png", "nodes": ["A", "B", "C", "D", "E"], "answer": ["B", "C", "E"], "exp": "Le confinement correct passe par B, C et E. Les autres ouvrent des branches instables.", "reward": "master_code", "fragment": "E"}, {"id": "l_boss", "label": "Boss multi-phases", "type": "boss_multi", "title": "Verrou de confinement", "scene": "Phase 1 : choisis le bon mot. Phase 2 : valide le bon objet système.", "prompt": "Résous les deux phases pour stabiliser le laboratoire.", "visual": "lab_scene_intro.png", "phase1": {"question": "Quel mot stabilise le système ?", "choices": ["SAFE", "CORE", "SEAL"], "answer": "SAFE"}, "phase2": {"question": "Quel objet système faut-il injecter ?", "answer": "master_code", "mode": "inventory"}, "exp": "Le mot SAFE et le Code maître sont nécessaires ensemble pour fermer la séquence de confinement.", "fragment": "F"}]};

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

const THEMES = {
  "": { body:'theme-night', title:'GAME ARENA', subtitle:'Une plateforme d’escape game immersive pensée pour le terrain, le téléphone et l’ordinateur.', mission:'Prépare une mission et lance-la.' },
  night: { body:'theme-night', title:'GAME ARENA', subtitle:'Mission urbaine sous pluie et néons.', mission:'Infiltration nocturne. Des indices ont été altérés. Ton équipe doit lire froidement, éviter les fausses pistes et sortir avec le meilleur score.', intro:['Transmission instable…','Une infiltration a été confirmée.','Lis vite, mais lis bien.','Mission autorisée.'] },
  jungle: { body:'theme-jungle', title:'GAME ARENA', subtitle:'Expédition parmi les ruines et glyphes.', mission:'Une ancienne voie est de nouveau ouverte. Les bons passages se lisent dans l’ordre, la forme et les détails.', intro:['La jungle ne se tait jamais complètement.','Les ruines se lisent par couches.','Expédition ouverte.'] },
  lab: { body:'theme-lab', title:'GAME ARENA', subtitle:'Protocole d’urgence dans un environnement instable.', mission:'Le système se dégrade. Ton équipe doit stabiliser, lire, trier et verrouiller le bon chemin avant la rupture.', intro:['L’alarme a déjà commencé.','Les écrans se contredisent.','Protocole activé.'] }
};

const COUNT_BY_DIFFICULTY = { facile:4, moyen:5, difficile:6, extreme:6 };

let state = {
  theme:'',
  totalPlayers:'',
  teamCount:'',
  publicType:'',
  difficulty:'',
  duration:'',
  soundMode:'on',
  teams:[],
  activeTeam:0,
  time:0,
  timerActive:false,
  selectedChallenges:[],
  index:0,
  inventory:[],
  selectedItem:null,
  picked:null,
  attempts:0,
  dragPool:[],
  dragSlots:[],
  hotspotChoice:null,
  keypadValue:'',
  nodeSelection:[],
  combineSelection:[],
  inventoryStepIndex:0,
  bossPhase:1,
  bossChoice:null,
  bossText:'',
  fragments:[]
};

function prepareAudio(){
  Object.entries(audioFiles).forEach(([k,v])=>{
    if(!audioPool[k]){
      const a = new Audio(v);
      a.preload='auto';
      a.loop = k.startsWith('theme_');
      a.volume = k.startsWith('theme_') ? 0.55 : 0.95;
      audioPool[k]=a;
    }
  });
}
function currentThemeTrack(){ return state.theme==='jungle' ? 'theme_jungle' : state.theme==='lab' ? 'theme_lab' : 'theme_night'; }
function autoEnableSound(){
  if(state.soundMode==='off'){ soundEnabled=false; save(); return; }
  if(soundEnabled) return;
  soundEnabled=true; prepareAudio(); save();
}
function playFile(name){
  if(!soundEnabled) return;
  try{
    prepareAudio();
    const a = audioPool[name].cloneNode();
    a.volume = audioPool[name].volume;
    a.play().catch(()=>{});
  }catch(e){}
}
function startThemeMusic(){
  if(!soundEnabled) return;
  prepareAudio();
  ['theme_night','theme_jungle','theme_lab'].forEach(k=>{ audioPool[k].pause(); audioPool[k].currentTime=0; });
  const key=currentThemeTrack();
  audioPool[key].currentTime=0;
  audioPool[key].play().catch(()=>{});
}
function stopThemeMusic(){
  prepareAudio();
  ['theme_night','theme_jungle','theme_lab'].forEach(k=>{ audioPool[k].pause(); audioPool[k].currentTime=0; });
}

function save(){ localStorage.setItem('fafa_v18', JSON.stringify({ ...state, soundEnabled })); }
function load(){
  try{
    const raw = localStorage.getItem('fafa_v18');
    if(raw){
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed);
      soundEnabled = !!parsed.soundEnabled;
    }
  }catch(e){}
}
function clearStore(){ localStorage.removeItem('fafa_v18'); }

function fmt(t){ const m=String(Math.floor(t/60)).padStart(2,'0'); const s=String(t%60).padStart(2,'0'); return `${m}:${s}`; }
function timerColor(){ return state.time>120 ? 'green' : state.time>45 ? 'orange' : 'red'; }
function syncTimerBadge(){
  const el = document.getElementById('live-timer');
  if(!el) return;
  el.textContent = '⏱ ' + fmt(state.time);
  el.className = 'badge timer timer-live ' + timerColor();
}
function currentTeam(){ return state.teams[state.activeTeam] || { name:'Équipe', players:[], score:0, progress:0 }; }
function currentPlayer(){ const t=currentTeam(); return t.players?.length ? (t.players[state.index % t.players.length] || t.name) : t.name; }
function setTheme(){ document.body.className = THEMES[state.theme || ''].body; }
function ready(){ return state.theme && state.totalPlayers && state.teamCount && state.publicType && state.difficulty && state.duration; }
function challengeCount(){ return COUNT_BY_DIFFICULTY[state.difficulty] || 4; }
function autoDistribution(){
  if(!state.totalPlayers || !state.teamCount) return 'à définir';
  const total=Number(state.totalPlayers), teams=Number(state.teamCount);
  const base=Math.floor(total/teams), rest=total%teams;
  return rest===0 ? `${teams} équipes de ${base}` : `${rest} équipes de ${base+1} · ${teams-rest} équipes de ${base}`;
}
function chooseChallenges(){ return (BANK[state.theme] || []).slice(0, challengeCount()); }

function iconForItem(item){
  const map = { badge_key:'🔑', cipher_disk:'💾', decoded_file:'📁', kan_segment:'🧬', route_map:'🗺️', glyph_piece:'🧩', totem_order:'🗿', ritual_key:'🔐', rune_word:'📜', temple_key:'🏺', circuit_map:'⚡', code_slice:'🧾', service_access:'🪪', safe_word:'🛡️', master_code:'💠' };
  return map[item] || '📦';
}
function labelForItem(item){
  const map = { badge_key:'Badge-clé', cipher_disk:'Disque chiffré', decoded_file:'Dossier décodé', kan_segment:'Segment KAN', route_map:'Carte de route', glyph_piece:'Fragment de glyphe', totem_order:'Ordre des totems', ritual_key:'Clé rituelle', rune_word:'Mot RUNE', temple_key:'Clé du temple', circuit_map:'Plan de circuit', code_slice:'Tranche de code', service_access:'Accès service', safe_word:'Mot SAFE', master_code:'Code maître' };
  return map[item] || item;
}

function renderAdmin(){
  setTheme();
  const theme = THEMES[state.theme || ''];
  APP.innerHTML = `
    <div class="hero">
      <div><img src="./assets/logo.png" class="hero-logo" alt="logo"></div>
      <div>
        <div class="kicker">FAFATRAINING</div>
        <h1>GAME ARENA</h1>
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
        <div><label>Nombre d’épreuves auto</label><input disabled value="${ready() ? challengeCount() + ' épreuves' : 'à définir'}"></div>
      </div>
      <div class="grid2" style="margin-top:14px">
        <div><label>Son</label><select id="soundMode">
          <option value="on" ${state.soundMode==='on'?'selected':''}>Activé automatiquement</option>
          <option value="off" ${state.soundMode==='off'?'selected':''}>Coupé</option>
        </select></div>
        <div><label>Guide réponses</label><input disabled value="${state.theme ? 'disponible après génération' : 'choisis un thème'}"></div>
      </div>
      <div class="summary-grid" style="margin-top:14px">
        <div class="card"><h4>Répartition auto</h4><div>${autoDistribution()}</div></div>
        <div class="card"><h4>Niveau attendu</h4><div>${state.difficulty || 'à définir'}</div></div>
        <div class="card"><h4>Variété disponible</h4><div>${state.theme ? `${(BANK[state.theme]||[]).length} systèmes disponibles` : 'à définir'}</div></div>
        <div class="card"><h4>Musique</h4><div>${state.soundMode==='off' ? 'coupée' : 'activée au lancement'}</div></div>
      </div>
      <div class="btns">
        <button class="btn-main" onclick="generateTeamsFromForm()">GÉNÉRER LES ÉQUIPES</button>
        <button class="btn-alt" onclick="resetAll()">RÉINITIALISER</button>
      </div>
      <div id="teamsEditor"></div>
    </section>`;
}
function readAdminForm(){
  state.theme = document.getElementById('theme').value;
  state.totalPlayers = document.getElementById('totalPlayers').value;
  state.teamCount = document.getElementById('teamCount').value;
  state.publicType = document.getElementById('publicType').value;
  state.difficulty = document.getElementById('difficulty').value;
  state.duration = document.getElementById('duration').value;
  state.soundMode = document.getElementById('soundMode').value;
  save();
}
function renderAnswerGuide(){
  const guide = state.selectedChallenges.map((c,i)=>{
    let ans = '';
    if(c.type==='image_hotspot') ans = c.hotspots.find(h=>h.id===c.answer)?.label || c.answer;
    else if(c.type==='drag_slots') ans = c.answer.join(' → ');
    else if(c.type==='inventory_steps') ans = c.steps.map(labelForItem).join(' → ');
    else if(c.type==='lock_code') ans = c.answer;
    else if(c.type==='circuit_toggle') ans = c.answer.join(', ');
    else if(c.type==='combine_items') ans = c.need.map(labelForItem).join(' + ');
    else if(c.type==='boss_multi') ans = `${c.phase1.answer} + ${c.phase2.mode==='inventory' ? labelForItem(c.phase2.answer) : c.phase2.answer}`;
    return `<div class="card"><strong>${i+1}. ${c.title}</strong><br>Réponse attendue : ${ans}</div>`;
  }).join('');
  return `<section class="panel" style="margin-top:14px"><h3>Guide réponses administrateur</h3><div class="team-grid">${guide}</div></section>`;
}
function generateTeamsFromForm(){
  readAdminForm();
  if(!ready()){
    alert('Remplis d’abord le thème, le nombre de joueurs, le nombre d’équipes, le public, la difficulté et la durée.');
    return;
  }
  state.selectedChallenges = chooseChallenges();
  const total = Number(state.totalPlayers), teams = Number(state.teamCount), suggested = Math.ceil(total/teams);
  state.teams = Array.from({length:teams}, (_,i)=>({ name:`Équipe ${i+1}`, players:Array.from({length:suggested}, ()=>''), score:0, progress:0 }));
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
        </div>`).join('')}
    </div>
    <div class="btns"><button class="btn-main" onclick="launchMission()">LANCER LA MISSION</button></div>
    ${renderAnswerGuide()}`;
}
function launchMission(){
  if(!state.teams.length){ alert('Génère d’abord les équipes.'); return; }
  autoEnableSound();
  state.teams = state.teams.map((team,i)=>({
    name: document.getElementById(`teamName_${i}`)?.value?.trim() || `Équipe ${i+1}`,
    players: (document.getElementById(`teamPlayers_${i}`)?.value || '').split('\n').map(x=>x.trim()).filter(Boolean),
    score:0, progress:0
  }));
  state.time = Number(state.duration || 0);
  state.index = 0;
  state.activeTeam = 0;
  state.inventory = [];
  state.selectedItem = null;
  state.picked = null;
  state.attempts = 0;
  state.dragPool = [];
  state.dragSlots = [];
  state.hotspotChoice = null;
  state.keypadValue = '';
  state.nodeSelection = [];
  state.combineSelection = [];
  state.inventoryStepIndex = 0;
  state.bossPhase = 1;
  state.bossChoice = null;
  state.bossText = '';
  state.fragments = [];
  state.timerActive = false;
  save();
  location.hash = '#admin-intro';
  renderRoute();
}
function showIntro(isPlayer=false){
  const theme = THEMES[state.theme];
  playFile('glitch');
  APP.innerHTML = `<section class="cinematic"><div class="cinematic-box"><div class="kicker">OUVERTURE CINÉMATIQUE</div><h1>ACCÈS MISSION</h1><div class="notice"><strong>Brief de mission :</strong><br>${theme.mission}</div><div class="notice"><strong>Important :</strong><br>le chrono part dès que tu entres dans la première épreuve.</div><div id="cineBox"></div><div class="btns"><button class="btn-alt" onclick="location.hash='#admin';renderRoute();">RETOUR ACCUEIL</button><button class="btn-main hidden" id="introBtn" onclick="${isPlayer ? 'goPlayer()' : 'goAdmin()'}">ENTRER DANS LA PREMIÈRE ÉPREUVE</button></div></div></section>`;
  let i=0; const box=document.getElementById('cineBox');
  function step(){
    if(i < (theme.intro||[]).length){
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
function startTicking(){
  if(state.timerActive) return;
  state.timerActive = true;
  save();
  startThemeMusic();
  syncTimerBadge();
  const tick = ()=>{
    const raw = localStorage.getItem('fafa_v18');
    if(raw){
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed);
      soundEnabled = !!parsed.soundEnabled;
    }
    if(!state.timerActive) return;
    state.time = Math.max(0, Number(state.time) - 1);
    if(state.time===45 || state.time===30 || state.time===15) playFile('tension');
    save();
    syncTimerBadge();
    if(state.time<=0){
      state.timerActive = false;
      save();
      finishMission(true);
      return;
    }
    setTimeout(tick, 1000);
  };
  setTimeout(tick, 1000);
}
function goAdmin(){ startTicking(); renderGame(); }
function goPlayer(){ startTicking(); renderGame(); }

function rewardItem(item){
  if(item && !state.inventory.includes(item)) state.inventory.push(item);
}
function renderInventory(showControls=true){
  const items = state.inventory.length ? state.inventory : [];
  return `<section class="panel studio-systems">
    <h3>Inventaire réel</h3>
    <div class="inventory-bar">
      ${Array.from({length:6}, (_,i)=>{
        const item = items[i] || null;
        const selected = item && state.selectedItem===item;
        return `<button class="inv-slot ${selected?'selected':''}" ${item ? `onclick="selectInventoryItem('${item}')"` : ''}>${item ? iconForItem(item) : '—'}<span>${item ? labelForItem(item) : 'Emplacement vide'}</span></button>`;
      }).join('')}
    </div>
    <div class="notice"><strong>Objet sélectionné :</strong> ${state.selectedItem ? labelForItem(state.selectedItem) : 'aucun'}</div>
    ${showControls ? '' : ''}
  </section>`;
}
function selectInventoryItem(item){
  state.selectedItem = state.selectedItem===item ? null : item;
  save();
  renderGame();
}

function currentChallenge(){ return state.selectedChallenges[state.index]; }
function resetPerChallengeState(ch){
  state.picked = null;
  state.attempts = 0;
  state.hotspotChoice = null;
  state.keypadValue = '';
  state.nodeSelection = [];
  state.combineSelection = [];
  state.inventoryStepIndex = 0;
  state.bossPhase = 1;
  state.bossChoice = null;
  state.bossText = '';
  state.dragPool = ch.type==='drag_slots' ? (ch.tokens || []).slice() : [];
  state.dragSlots = ch.type==='drag_slots' ? Array((ch.answer||[]).length).fill('') : [];
}
function nextChallenge(){
  currentTeam().progress = Math.max(currentTeam().progress, state.index+1);
  state.index++;
  state.activeTeam = (state.activeTeam + 1) % state.teams.length;
  if(state.index >= state.selectedChallenges.length){ finishMission(false); return; }
  resetPerChallengeState(currentChallenge());
  save();
  renderGame();
}
function showFree(){
  const c = currentChallenge();
  const slot = document.getElementById('freeSlot');
  if(slot) slot.innerHTML = `<div class="freeclue"><strong>Indice discret :</strong><br>${c.exp}</div>`;
}
function useHint(level){
  const c = currentChallenge();
  currentTeam().score = Math.max(0, currentTeam().score - (level===1 ? 40 : 90));
  const fb = document.getElementById('feedback');
  if(fb) fb.innerHTML = `<div class="feedback help"><strong>${level===1 ? 'Carte aide' : 'Carte bonus'}</strong><br>${c.exp}</div>`;
  save();
}

function renderImageHotspot(ch){
  return `<div class="hotspot-wrap">
    <div class="hotspot-stage">
      <img src="./assets/${ch.visual}" alt="${ch.title}">
      ${ch.hotspots.map(h=>`<button class="hotspot ${state.hotspotChoice===h.id?'selected':''}" style="left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%;" onclick="pickHotspot('${h.id}')" aria-label="${h.label}"></button>`).join('')}
    </div>
    <div class="notice"><strong>Zone choisie :</strong> ${ch.hotspots.find(h=>h.id===state.hotspotChoice)?.label || 'aucune'}</div>
  </div>`;
}
function pickHotspot(id){ state.hotspotChoice=id; save(); renderGame(); }

function renderDragSlots(ch){
  return `<div class="drag-board">
    <div>
      <div class="challenge-sub">Éléments à glisser</div>
      <div class="drag-list">
        ${state.dragPool.map((tok,i)=> tok ? `<div class="drag-token" draggable="true" ondragstart="dragStartToken(${i})">${tok}</div>` : '').join('')}
      </div>
    </div>
    <div>
      <div class="challenge-sub">Emplacements</div>
      <div class="drag-list">
        ${state.dragSlots.map((tok,i)=>`<div class="drag-slot" ondragover="allowDrop(event)" ondrop="dropOnSlot(${i})">${tok || 'Déposer ici'}</div>`).join('')}
      </div>
    </div>
  </div>`;
}
let draggedTokenIndex = null;
function dragStartToken(i){ draggedTokenIndex = i; }
function allowDrop(ev){ ev.preventDefault(); }
function dropOnSlot(i){
  const token = state.dragPool[draggedTokenIndex];
  if(!token) return;
  if(state.dragSlots[i]) return;
  state.dragSlots[i] = token;
  state.dragPool[draggedTokenIndex] = '';
  save();
  renderGame();
}
function removeFromSlot(i){
  const tok = state.dragSlots[i];
  if(!tok) return;
  const empty = state.dragPool.findIndex(x=>!x);
  if(empty>=0) state.dragPool[empty]=tok; else state.dragPool.push(tok);
  state.dragSlots[i]='';
  save();
  renderGame();
}

function renderInventorySteps(ch){
  const done = state.inventoryStepIndex;
  return `${renderInventory()}<div class="notice"><strong>Étape actuelle :</strong> ${done+1} / ${ch.steps.length}</div><div class="notice"><strong>Séquence attendue :</strong> ${ch.steps.map(labelForItem).join(' → ')}</div><div class="btns"><button class="btn-main" onclick="useSelectedForStep()">UTILISER L’OBJET SÉLECTIONNÉ</button></div>`;
}
function useSelectedForStep(){
  const ch = currentChallenge();
  if(ch.type!=='inventory_steps') return;
  const needed = ch.steps[state.inventoryStepIndex];
  if(state.selectedItem===needed){
    state.inventoryStepIndex += 1;
    playFile('ok');
  } else {
    playFile('bad');
  }
  save();
  renderGame();
}

function renderLockCode(ch){
  return `<div class="decoder-wrap">
    <div class="combo-line"><strong>Code :</strong> ${state.keypadValue || '—'}</div>
    <div class="node-grid">
      ${['1','2','3','4','5','6','7','8','9','0'].map(n=>`<button class="node-btn" onclick="pressKey('${n}', ${ch.length||4})">${n}</button>`).join('')}
    </div>
    <div class="btns"><button class="btn-alt" onclick="clearKeypad()">EFFACER</button></div>
  </div>`;
}
function pressKey(n, limit){
  if((state.keypadValue||'').length >= limit) return;
  state.keypadValue += n;
  save();
  renderGame();
}
function clearKeypad(){ state.keypadValue=''; save(); renderGame(); }

function renderCircuitToggle(ch){
  return `<div class="node-grid">${ch.nodes.map(n=>`<button class="node-btn ${state.nodeSelection.includes(n)?'active':''}" onclick="toggleNode('${n}')">${n}</button>`).join('')}</div>`;
}
function toggleNode(n){
  if(state.nodeSelection.includes(n)) state.nodeSelection = state.nodeSelection.filter(x=>x!==n);
  else state.nodeSelection.push(n);
  save();
  renderGame();
}

function renderCombineItems(ch){
  return `${renderInventory()}<div class="combo-line"><strong>Combinaison actuelle :</strong> ${state.combineSelection.map(labelForItem).join(' + ') || 'aucune'}</div><div class="btns"><button class="btn-alt" onclick="addSelectedToCombo()">AJOUTER L’OBJET SÉLECTIONNÉ</button><button class="btn-alt" onclick="resetCombo()">RÉINITIALISER</button></div>`;
}
function addSelectedToCombo(){
  if(!state.selectedItem) return;
  if(state.combineSelection.includes(state.selectedItem)) return;
  if(state.combineSelection.length >= 2) return;
  state.combineSelection.push(state.selectedItem);
  save();
  renderGame();
}
function resetCombo(){ state.combineSelection=[]; save(); renderGame(); }

function renderBossMulti(ch){
  if(state.bossPhase===1){
    return `<div class="phase-box"><strong>Phase 1</strong><br>${ch.phase1.question}<div class="choice-grid" style="margin-top:12px">${ch.phase1.choices.map(choice=>`<button class="choice ${state.bossChoice===choice?'selected':''}" onclick="pickBossChoice('${choice.replace(/'/g,"\'")}')">${choice}</button>`).join('')}</div></div>`;
  }
  if(ch.phase2.mode==='inventory'){
    return `<div class="phase-box"><strong>Phase 2</strong><br>${ch.phase2.question}</div>${renderInventory()}`;
  }
  return `<div class="phase-box"><strong>Phase 2</strong><br>${ch.phase2.question}<div class="panel" style="padding:14px;margin-top:14px"><label>Réponse</label><input value="${state.bossText}" oninput="state.bossText=this.value;save();" placeholder="Entre ta réponse"></div></div>`;
}
function pickBossChoice(choice){ state.bossChoice=choice; save(); renderGame(); }

function renderFunctionalModule(ch){
  if(ch.type==='image_hotspot') return renderImageHotspot(ch);
  if(ch.type==='drag_slots') return renderDragSlots(ch);
  if(ch.type==='inventory_steps') return renderInventorySteps(ch);
  if(ch.type==='lock_code') return renderLockCode(ch);
  if(ch.type==='circuit_toggle') return renderCircuitToggle(ch);
  if(ch.type==='combine_items') return renderCombineItems(ch);
  if(ch.type==='boss_multi') return renderBossMulti(ch);
  return '';
}
function currentAnswerSummary(ch){
  if(ch.type==='image_hotspot') return ch.hotspots.find(h=>h.id===state.hotspotChoice)?.label || 'aucune';
  if(ch.type==='drag_slots') return state.dragSlots.join(' | ') || 'aucun';
  if(ch.type==='inventory_steps') return `${state.inventoryStepIndex}/${ch.steps.length} étape(s)`;
  if(ch.type==='lock_code') return state.keypadValue || 'vide';
  if(ch.type==='circuit_toggle') return state.nodeSelection.join(', ') || 'aucun';
  if(ch.type==='combine_items') return state.combineSelection.map(labelForItem).join(' + ') || 'aucune';
  if(ch.type==='boss_multi') return state.bossPhase===1 ? (state.bossChoice || 'aucun') : (ch.phase2.mode==='inventory' ? (state.selectedItem ? labelForItem(state.selectedItem) : 'aucun') : (state.bossText || 'vide'));
  return '';
}
function renderGame(){
  const ch = currentChallenge();
  const main = `
    <section class="game-shell fadein">
      <div class="hud">
        <div class="hud-left">
          <div class="badge points">${currentTeam().name} · ${currentTeam().score} pts</div>
          <div class="badge meta">Épreuve ${state.index+1}/${state.selectedChallenges.length}</div>
          <div class="badge meta">${ch.label}</div>
        </div>
        <div class="hud-right"><div id="live-timer" class="badge timer timer-live ${timerColor()}">⏱ ${fmt(state.time)}</div></div>
      </div>
      <div class="turn">🔥 C’EST À : ${currentPlayer()} DE JOUER</div>
      <div class="rules"><strong>Règle :</strong> lis la scène, résous le système proposé, puis utilise une aide seulement si nécessaire.</div>
      <div class="story">${ch.scene}</div>
      <div class="help-floating">
        <button class="help-pill help-aide" onclick="useHint(1)">AIDE</button>
        <button class="help-pill help-bonus" onclick="useHint(2)">BONUS</button>
        <button class="help-pill help-info" onclick="showFree()">INDICE</button>
      </div>
      <h2 class="challenge-title">${ch.title}</h2>
      <div class="challenge-sub">Type d’épreuve : ${ch.label}</div>
      <div class="story"><strong>Objectif :</strong><br>${ch.prompt}</div>
      <div id="freeSlot"></div>
      ${renderFunctionalModule(ch)}
      ${ch.type==='drag_slots' ? `<div class="btns"><button class="btn-alt" onclick="removeLastFilledSlot()">RETIRER LE DERNIER ÉLÉMENT</button></div>` : ''}
      <div class="notice"><strong>État actuel :</strong> ${currentAnswerSummary(ch)}</div>
      <div id="feedback"></div>
    </section>`;
  APP.innerHTML = `<div class="game-layout">${main}</div><div class="validate-bar"><button class="validate-btn" onclick="validateChallenge()">VALIDER LA RÉPONSE</button></div>`;
  syncTimerBadge();
}
function removeLastFilledSlot(){
  for(let i=state.dragSlots.length-1;i>=0;i--){
    if(state.dragSlots[i]){
      removeFromSlot(i);
      break;
    }
  }
}
function validateChallenge(){
  const ch = currentChallenge();
  let ok = false;
  if(ch.type==='image_hotspot') ok = state.hotspotChoice === ch.answer;
  else if(ch.type==='drag_slots') ok = JSON.stringify(state.dragSlots) === JSON.stringify(ch.answer);
  else if(ch.type==='inventory_steps') ok = state.inventoryStepIndex >= ch.steps.length;
  else if(ch.type==='lock_code') ok = state.keypadValue === ch.answer;
  else if(ch.type==='circuit_toggle') ok = JSON.stringify([...state.nodeSelection].sort()) === JSON.stringify([...ch.answer].sort());
  else if(ch.type==='combine_items') ok = JSON.stringify([...state.combineSelection].sort()) === JSON.stringify([...ch.need].sort());
  else if(ch.type==='boss_multi'){
    if(state.bossPhase===1){
      ok = state.bossChoice === ch.phase1.answer;
      if(ok){
        state.bossPhase = 2;
        save();
        renderGame();
        return;
      }
    } else {
      ok = ch.phase2.mode==='inventory' ? state.selectedItem === ch.phase2.answer : state.bossText === ch.phase2.answer;
    }
  }
  const fb = document.getElementById('feedback');
  if(ok){
    currentTeam().score += 160;
    currentTeam().progress = Math.max(currentTeam().progress, state.index+1);
    rewardItem(ch.reward);
    state.fragments.push(ch.fragment);
    playFile('ok');
    fb.innerHTML = `<div class="feedback ok"><strong>✅ Bonne réponse.</strong><br><strong>Explication :</strong> ${ch.exp}${ch.reward ? `<br><br><strong>Objet gagné :</strong> ${labelForItem(ch.reward)}` : ''}<br><br><strong>Fragment obtenu :</strong> ${ch.fragment}</div><div class="btns"><button class="btn-main" onclick="nextChallenge()">ÉPREUVE SUIVANTE</button></div>`;
  } else {
    state.attempts += 1;
    currentTeam().score = Math.max(0, currentTeam().score - (state.attempts<2 ? 40 : 80));
    playFile('bad');
    if(state.attempts<2){
      fb.innerHTML = `<div class="feedback bad"><strong>❌ Mauvaise piste.</strong><br>Tu peux corriger et tenter une seconde fois avant la sanction finale.<br><br><span class="small">Pénalité : -40 points.</span></div>`;
    } else {
      fb.innerHTML = `<div class="feedback bad"><strong>💥 Défi perdu.</strong><br>${ch.exp}</div><div class="btns"><button class="btn-main" onclick="nextChallenge()">ÉPREUVE SUIVANTE</button></div>`;
    }
  }
  save();
}
function finishMission(timeout){
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
      <div class="notice"><strong>Inventaire final :</strong> ${state.inventory.length ? state.inventory.map(labelForItem).join(' · ') : 'aucun objet conservé'}</div>
      <div class="preview-grid" style="margin-top:14px">${ranking.map((team,idx)=>`<div class="card"><h4>${idx+1}. ${team.name}</h4>Score : ${team.score} pts<br>Progression : ${team.progress}/${state.selectedChallenges.length}<br>Joueurs : ${team.players.filter(Boolean).length}</div>`).join('')}</div>
      <div class="btns"><button class="btn-main" onclick="resetAll()">RETOUR ACCUEIL</button></div>
    </section>`;
}
function resetAll(){
  clearStore();
  soundEnabled = false;
  state = {
    theme:'', totalPlayers:'', teamCount:'', publicType:'', difficulty:'', duration:'', soundMode:'on',
    teams:[], activeTeam:0, time:0, timerActive:false, selectedChallenges:[], index:0, inventory:[], selectedItem:null,
    picked:null, attempts:0, dragPool:[], dragSlots:[], hotspotChoice:null, keypadValue:'', nodeSelection:[],
    combineSelection:[], inventoryStepIndex:0, bossPhase:1, bossChoice:null, bossText:'', fragments:[]
  };
  location.hash='#admin';
  renderRoute();
}
function renderRoute(){
  load();
  setTheme();
  const r = location.hash || '#admin';
  if(r==='#admin-intro'){ stopThemeMusic(); showIntro(false); return; }
  if(r==='#admin-play'){ if(!state.selectedChallenges.length){ stopThemeMusic(); renderAdmin(); return; } renderGame(); return; }
  stopThemeMusic();
  renderAdmin();
}
function startMissionFlow(){
  location.hash = '#admin-play';
  renderRoute();
}
function goAdmin(){ startTicking(); startMissionFlow(); }
function goPlayer(){ startTicking(); startMissionFlow(); }

function startTicking(){
  if(state.timerActive) return;
  state.timerActive=true;
  save();
  startThemeMusic();
  syncTimerBadge();
  const tick = ()=>{
    const raw = localStorage.getItem('fafa_v18');
    if(raw){
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed);
      soundEnabled = !!parsed.soundEnabled;
    }
    if(!state.timerActive) return;
    state.time = Math.max(0, Number(state.time)-1);
    if(state.time===45 || state.time===30 || state.time===15) playFile('tension');
    save();
    syncTimerBadge();
    if(state.time<=0){
      state.timerActive=false;
      save();
      finishMission(true);
      return;
    }
    setTimeout(tick,1000);
  };
  setTimeout(tick,1000);
}
function resizeRain(){
  RAIN.width = innerWidth;
  RAIN.height = innerHeight;
}
let drops=[];
function initRain(){
  resizeRain();
  drops = Array.from({length:180}, ()=>({x:Math.random()*RAIN.width, y:Math.random()*RAIN.height, l:10+Math.random()*18, v:6+Math.random()*8}));
}
function drawRain(){
  CTX.clearRect(0,0,RAIN.width,RAIN.height);
  CTX.strokeStyle='rgba(114,204,255,.35)';
  CTX.lineWidth=1;
  CTX.beginPath();
  for(const d of drops){
    CTX.moveTo(d.x,d.y);
    CTX.lineTo(d.x-4,d.y+d.l);
    d.y += d.v; d.x -= .6;
    if(d.y>RAIN.height || d.x<-20){ d.x=Math.random()*RAIN.width+40; d.y=-20; }
  }
  CTX.stroke();
  requestAnimationFrame(drawRain);
}
window.addEventListener('hashchange', renderRoute);
window.addEventListener('resize', resizeRain);
initRain(); drawRain(); renderRoute();
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
