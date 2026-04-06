
let GAMES = [], SCENARIOS = [], MISSIONS = [];
const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let timerInterval = null;

function openTab(id){ qsa('.tab').forEach(b => b.classList.toggle('active', b.dataset.target===id)); qsa('.tab-panel').forEach(p => p.classList.toggle('active', p.id===id)); }

async function init(){
  GAMES = await fetch('./data/games.json').then(r=>r.json());
  SCENARIOS = await fetch('./data/scenarios.json').then(r=>r.json());
  MISSIONS = await fetch('./data/missions.json').then(r=>r.json());
  qs('#countGames').textContent = GAMES.length;
  qs('#countScenarios').textContent = SCENARIOS.length;
  qs('#countMissions').textContent = MISSIONS.length;
  qs('#teamCount').innerHTML = Array.from({length:7},(_,i)=>`<option value="${i+2}">${i+2} équipes</option>`).join('');
  qs('#gameSelect').innerHTML = GAMES.map(g=>`<option value="${g.key}">${g.title}</option>`).join('');
  renderLibrary();
  renderAnimateur();
  hydrateFromUrl();
}
function hydrateFromUrl(){
  const p = new URLSearchParams(location.search);
  const scenario = p.get('scenario');
  const mission = p.get('mission');
  if (scenario && mission) {
    openTab('mission');
    openMission(scenario, Number(mission));
  }
}
function findScenarios(){
  const age = qs('#ageSelect').value;
  const diff = qs('#difficultySelect').value;
  const gameKey = qs('#gameSelect').value;
  const list = SCENARIOS.filter(s => s.age_key===age && s.difficulty_key===diff && s.game_key===gameKey);
  qs('#scenarioResults').innerHTML = list.length ? list.map(s => `
    <article class="card">
      <div class="pillbar">
        <span class="pill">${esc(s.game_title)}</span>
        <span class="pill">${esc(s.age_label)}</span>
        <span class="pill">${esc(s.difficulty_label)}</span>
      </div>
      <h3>${esc(s.game_title)} · ${esc(s.univers)}</h3>
      <p>${esc(s.story)}</p>
      <p><strong>Durée :</strong> ${s.duration_min} min · <strong>Missions :</strong> ${s.round_count} · <strong>Équipes :</strong> ${esc(s.team_range)}</p>
      <div class="actions">
        <button onclick="showScenarioMissions('${s.id}')">Voir les missions</button>
        <button class="ghost" onclick="openMission('${s.id}',1)">Ouvrir mission 1</button>
      </div>
    </article>
  `).join('') : `<div class="notice">Aucun scénario compatible trouvé.</div>`;
}
function generateTeams(){
  const n = Number(qs('#teamCount').value || 2);
  const results = [];
  const codes = ['ALPHA','BRAVO','CHARLIE','DELTA','ECHO','FOXTROT','GAMMA','OMEGA'];
  for (let i=0;i<n;i++) results.push(codes[i]);
  qs('#teamResults').innerHTML = results.map((c,idx)=>`
    <article class="card">
      <h3>Équipe ${idx+1}</h3>
      <p><strong>Code équipe :</strong> ${c}</p>
      <p>Utilise ce code pour identifier l’équipe dans les feuilles terrain ou les messages.</p>
    </article>
  `).join('');
}
function scenarioMissions(sid){
  const scenario = SCENARIOS.find(s=>s.id===sid);
  const missions = MISSIONS.filter(m=>m.scenario_id===sid).sort((a,b)=>a.number-b.number);
  return {scenario, missions};
}
function showScenarioMissions(sid){
  openTab('mission');
  const {scenario, missions} = scenarioMissions(sid);
  qs('#missionOutput').innerHTML = `
    <div class="pillbar">
      <span class="pill">${esc(scenario.game_title)}</span>
      <span class="pill">${esc(scenario.age_label)}</span>
      <span class="pill">${esc(scenario.difficulty_label)}</span>
    </div>
    <h2>${esc(scenario.game_title)} · ${esc(scenario.univers)}</h2>
    <p>${esc(scenario.story)}</p>
    <ul>
      ${missions.map(m=>`<li><button onclick="openMission('${sid}',${m.number})">Mission ${m.number}</button> — ${esc(m.title)}</li>`).join('')}
    </ul>
  `;
}
function openMission(sid, num){
  const mission = MISSIONS.find(m=>m.scenario_id===sid && m.number===num);
  const scenario = SCENARIOS.find(s=>s.id===sid);
  if (!mission || !scenario) return;
  openTab('mission');
  qs('#missionOutput').innerHTML = `
    <div class="pillbar">
      <span class="pill">${esc(scenario.game_title)}</span>
      <span class="pill">${esc(scenario.age_label)}</span>
      <span class="pill">${esc(scenario.difficulty_label)}</span>
      <span class="pill">Mission ${mission.number}</span>
    </div>
    <h2>${esc(mission.title)}</h2>
    <p><strong>Résumé :</strong> ${esc(mission.summary)}</p>
    <p><strong>Objectif :</strong> ${esc(mission.objective)}</p>
    <p><strong>Consigne :</strong> ${esc(mission.instruction)}</p>
    <div class="timer" id="timerBox">00:${String(mission.timer_minutes).padStart(2,'0')}:00</div>
    <div class="actions">
      <button onclick="startTimer(${mission.timer_minutes})">Lancer le chrono</button>
      <button class="ghost" onclick="showAnswer('${sid}',${num})">Voir indice / réponse animateur</button>
    </div>
    <div class="result-grid">
      <article class="card">
        <h3>QR cliquable</h3>
        <p>Tu peux cliquer directement dans l’app pour ouvrir la mission suivante.</p>
        <button onclick="openMission('${sid}', ${Math.min(mission.number+1, scenario.round_count)})">Mission suivante</button>
      </article>
      <article class="card">
        <h3>QR à scanner</h3>
        <img class="qr-img" src="./qr/${mission.id.replaceAll('__','_')}.png" alt="QR">
        <p>Ce QR ouvre exactement cette mission sur téléphone.</p>
      </article>
    </div>
  `;
}
function startTimer(minutes){
  clearInterval(timerInterval);
  let remaining = minutes * 60;
  const box = qs('#timerBox');
  const tick = () => {
    const mm = String(Math.floor(remaining/60)).padStart(2,'0');
    const ss = String(remaining%60).padStart(2,'0');
    box.textContent = `00:${mm}:${ss}`;
    if (remaining <= 0) { clearInterval(timerInterval); box.textContent = '⏱ Temps écoulé'; return; }
    remaining -= 1;
  };
  tick();
  timerInterval = setInterval(tick, 1000);
}
function showAnswer(sid, num){
  const mission = MISSIONS.find(m=>m.scenario_id===sid && m.number===num);
  if (!mission) return;
  alert(`Indice : ${mission.hint}\n\nRéponse attendue : ${mission.expected_answer}`);
}
function renderLibrary(){
  const q = qs('#searchInput').value.toLowerCase().trim();
  const list = SCENARIOS.filter(s => {
    const blob = [s.game_title,s.family,s.univers,s.description,s.story].join(' ').toLowerCase();
    return !q || blob.includes(q);
  });
  qs('#libraryGrid').innerHTML = list.map(s=>`
    <article class="card">
      <div class="pillbar">
        <span class="pill">${esc(s.game_title)}</span>
        <span class="pill">${esc(s.family)}</span>
        <span class="pill">${esc(s.age_label)}</span>
      </div>
      <h3>${esc(s.game_title)} · ${esc(s.univers)}</h3>
      <p>${esc(s.description)}</p>
      <p><strong>Histoire :</strong> ${esc(s.story)}</p>
      <div class="actions">
        <button onclick="showScenarioMissions('${s.id}')">Voir missions</button>
      </div>
    </article>
  `).join('');
}
function renderAnimateur(){
  qs('#animateurGrid').innerHTML = MISSIONS.slice(0,120).map(m=>{
    const s = SCENARIOS.find(x=>x.id===m.scenario_id);
    return `
      <article class="card">
        <div class="pillbar">
          <span class="pill">${esc(s.game_title)}</span>
          <span class="pill">${esc(s.age_label)}</span>
          <span class="pill">M${m.number}</span>
        </div>
        <h3>${esc(m.title)}</h3>
        <p><strong>Réponse :</strong> ${esc(m.expected_answer)}</p>
        <p><strong>Indice :</strong> ${esc(m.hint)}</p>
        <p><strong>Chrono :</strong> ${m.timer_minutes} min</p>
      </article>
    `;
  }).join('');
}
init();
