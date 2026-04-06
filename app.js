
let GAMES = [], SCENARIOS = [], MISSIONS = [];
const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const TEAM_CODES = ['ALPHA','BRAVO','CHARLIE','DELTA','ECHO','FOXTROT','GAMMA','OMEGA'];
let currentPlayer = {scenarioId:null, missionIndex:0, duration:60, teamCode:'', timer:null, remaining:0};

function openTab(id){
  qsa('.tab').forEach(b => b.classList.toggle('active', b.dataset.target===id));
  qsa('.tab-panel').forEach(p => p.classList.toggle('active', p.id===id));
}
async function init(){
  GAMES = await fetch('./data/games.json').then(r=>r.json());
  SCENARIOS = await fetch('./data/scenarios.json').then(r=>r.json());
  MISSIONS = await fetch('./data/missions.json').then(r=>r.json());
  qs('#countGames').textContent = GAMES.length;
  qs('#countScenarios').textContent = SCENARIOS.length;
  qs('#countMissions').textContent = MISSIONS.length;
  qs('#gameSelect').innerHTML = GAMES.map(g=>`<option value="${g.key}">${g.title}</option>`).join('');
  qs('#teamCount').innerHTML = Array.from({length:7}, (_,i)=>`<option value="${i+2}">${i+2} équipes</option>`).join('');
  qs('#playerScenarioSelect').innerHTML = SCENARIOS.map(s => `<option value="${s.id}">${s.game_title} · ${s.age_label} · ${s.difficulty_label}</option>`).join('');
  renderLibrary();
  renderAnimateur();
  hydratePlayerLink();
}
function scenarioById(id){ return SCENARIOS.find(s => s.id===id); }
function missionsByScenario(id){ return MISSIONS.filter(m => m.scenario_id===id).sort((a,b)=>a.number-b.number); }

function prepareSession(){
  const gameKey = qs('#gameSelect').value;
  const age = qs('#ageSelect').value;
  const diff = qs('#difficultySelect').value;
  const teamCount = Number(qs('#teamCount').value || 2);
  const duration = Number(qs('#durationSelect').value || 60);
  const name = qs('#sessionName').value || 'Mission FAFATRAINING';

  const scenario = SCENARIOS.find(s => s.game_key===gameKey && s.age_key===age && s.difficulty_key===diff);
  if (!scenario){
    qs('#sessionSummary').textContent = "Aucun scénario trouvé.";
    return;
  }

  qs('#sessionSummary').innerHTML = `
    <strong>${esc(name)}</strong><br>
    Jeu : <strong>${esc(scenario.game_title)}</strong> · Âge : <strong>${esc(scenario.age_label)}</strong> · Difficulté : <strong>${esc(scenario.difficulty_label)}</strong><br>
    Durée totale de partie : <strong>${duration} min</strong> · Missions : <strong>${scenario.round_count}</strong><br>
    Ce scénario est maintenant prêt à être partagé aux joueurs.
  `;

  const ms = missionsByScenario(scenario.id);
  qs('#scenarioPreview').innerHTML = `
    <article class="card">
      <div class="pillbar">
        <span class="pill">${esc(scenario.game_title)}</span>
        <span class="pill">${esc(scenario.family)}</span>
        <span class="pill">${esc(scenario.universe)}</span>
      </div>
      <h3>Scénario préparé</h3>
      <p>${esc(scenario.hook)}</p>
      <p class="meta"><strong>Tonalité :</strong> ${esc(scenario.tone)}</p>
      <ul>${ms.map(m=>`<li>Mission ${m.number} · ${esc(m.title)}</li>`).join('')}</ul>
    </article>
  `;

  qs('#teamLinks').innerHTML = TEAM_CODES.slice(0,teamCount).map((code, idx) => {
    const link = playerLink(scenario.id, code, duration);
    return `
      <article class="card">
        <h3>Équipe ${idx+1}</h3>
        <p><strong>Code équipe :</strong> ${code}</p>
        <p><strong>Lien joueurs :</strong><br><small>${esc(link)}</small></p>
        <div class="actions">
          <button onclick="copyLink('${link.replace(/'/g,'&#39;')}')">Copier le lien</button>
          <button class="ghost" onclick="openPlayerLink('${link.replace(/'/g,'&#39;')}')">Ouvrir</button>
        </div>
        <img class="qr-img" src="${qrFor(link)}" alt="QR équipe ${idx+1}">
      </article>
    `;
  }).join('');
}
function playerLink(sid, teamCode, duration){
  const base = absoluteIndex();
  return `${base}?player=1&scenario=${encodeURIComponent(sid)}&team=${encodeURIComponent(teamCode)}&duration=${duration}`;
}
function absoluteIndex(){
  const u = new URL(window.location.href);
  return u.origin + u.pathname.replace(/\/[^\/]*$/, '/index.html');
}
function qrFor(url){
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
}
function copyLink(link){
  navigator.clipboard.writeText(link);
  alert('Lien copié.');
}
function openPlayerLink(link){
  window.open(link, '_blank');
}
function hydratePlayerLink(){
  const p = new URLSearchParams(window.location.search);
  if (p.get('player') === '1' && p.get('scenario')){
    openTab('player');
    qs('#playerLobby').classList.add('hidden');
    qs('#playerGame').classList.remove('hidden');
    currentPlayer.scenarioId = p.get('scenario');
    currentPlayer.teamCode = p.get('team') || '';
    currentPlayer.duration = Number(p.get('duration') || 60);
    currentPlayer.missionIndex = 0;
    renderPlayerGame();
  }
}
function launchPlayerGame(){
  const sid = qs('#playerScenarioSelect').value;
  const teamCode = (qs('#teamCodeInput').value || '').toUpperCase() || 'ALPHA';
  const duration = Number(qs('#playerDurationSelect').value || 60);
  currentPlayer = {scenarioId:sid, missionIndex:0, duration, teamCode, timer:null, remaining:duration*60};
  qs('#playerLobby').classList.add('hidden');
  qs('#playerGame').classList.remove('hidden');
  renderPlayerGame();
}
function renderPlayerGame(){
  const s = scenarioById(currentPlayer.scenarioId);
  const ms = missionsByScenario(currentPlayer.scenarioId);
  const m = ms[currentPlayer.missionIndex];
  if (!s || !m) return;

  qs('#pillGame').textContent = s.game_title;
  qs('#pillAge').textContent = s.age_label;
  qs('#pillDiff').textContent = s.difficulty_label;
  qs('#pillTeam').textContent = currentPlayer.teamCode || 'Équipe';
  qs('#playerGameTitle').textContent = `${s.game_title} · Mission ${m.number}/${ms.length}`;
  qs('#playerHook').textContent = s.hook;
  qs('#missionTitle').textContent = m.title;
  qs('#missionSummary').textContent = m.summary;
  qs('#missionInstruction').textContent = m.instruction;
  qs('#missionType').textContent = m.answer_type;
  qs('#validationResult').textContent = "Entre la réponse si la mission demande un code ou un mot. Pour les défis photo, vote ou validation sociale, c’est l’animateur qui valide.";
  const missionLink = playerLink(currentPlayer.scenarioId, currentPlayer.teamCode, currentPlayer.duration) + `&mission=${m.number}`;
  qs('#missionQr').src = qrFor(missionLink);

  if (!currentPlayer.remaining){
    currentPlayer.remaining = currentPlayer.duration * 60;
    updateGlobalTimer();
  } else {
    updateGlobalTimer();
  }
}
function startGlobalTimer(){
  if (currentPlayer.timer) return;
  if (!currentPlayer.remaining) currentPlayer.remaining = currentPlayer.duration * 60;
  currentPlayer.timer = setInterval(() => {
    currentPlayer.remaining -= 1;
    updateGlobalTimer();
    if (currentPlayer.remaining <= 0){
      clearInterval(currentPlayer.timer);
      currentPlayer.timer = null;
      qs('#globalTimer').textContent = '⏱ Temps écoulé';
    }
  }, 1000);
}
function updateGlobalTimer(){
  const total = Math.max(0, currentPlayer.remaining || currentPlayer.duration*60);
  const mm = String(Math.floor(total/60)).padStart(2,'0');
  const ss = String(total%60).padStart(2,'0');
  qs('#globalTimer').textContent = `00:${mm}:${ss}`;
}
function prevMission(){
  if (currentPlayer.missionIndex > 0){
    currentPlayer.missionIndex -= 1;
    renderPlayerGame();
  }
}
function nextMission(){
  const ms = missionsByScenario(currentPlayer.scenarioId);
  if (currentPlayer.missionIndex < ms.length - 1){
    currentPlayer.missionIndex += 1;
    renderPlayerGame();
  }
}
function backToLobby(){
  if (currentPlayer.timer){
    clearInterval(currentPlayer.timer);
    currentPlayer.timer = null;
  }
  currentPlayer = {scenarioId:null, missionIndex:0, duration:60, teamCode:'', timer:null, remaining:0};
  qs('#playerGame').classList.add('hidden');
  qs('#playerLobby').classList.remove('hidden');
  openTab('player');
}
function validateCurrentMission(){
  const ms = missionsByScenario(currentPlayer.scenarioId);
  const m = ms[currentPlayer.missionIndex];
  const v = (qs('#answerInput').value || '').trim().toUpperCase();
  if (!v){
    qs('#validationResult').textContent = "Entre une réponse ou un code.";
    return;
  }
  if (v === (m.expected_answer || '').toUpperCase()){
    qs('#validationResult').textContent = "✅ Bonne réponse. Tu peux passer à la mission suivante.";
  } else {
    qs('#validationResult').textContent = "❌ Réponse différente. Réessaie ou demande la validation animateur si la mission n’est pas un simple code.";
  }
}
function renderLibrary(){
  const q = (qs('#searchInput').value || '').toLowerCase().trim();
  qs('#libraryGrid').innerHTML = SCENARIOS.filter(s => {
    const blob = [s.game_title,s.family,s.universe,s.hook,s.tone].join(' ').toLowerCase();
    return !q || blob.includes(q);
  }).map(s => `
    <article class="card">
      <div class="pillbar">
        <span class="pill">${esc(s.game_title)}</span>
        <span class="pill">${esc(s.family)}</span>
        <span class="pill">${esc(s.age_label)}</span>
        <span class="pill">${esc(s.difficulty_label)}</span>
      </div>
      <h3>${esc(s.game_title)} · ${esc(s.universe)}</h3>
      <p>${esc(s.hook)}</p>
      <p class="meta"><strong>Missions :</strong> ${s.round_count} · <strong>Durée conseillée :</strong> ${s.duration_min} min</p>
      <div class="actions">
        <button onclick="previewScenario('${s.id}')">Voir les missions</button>
      </div>
    </article>
  `).join('');
}
function previewScenario(sid){
  openTab('library');
  const s = scenarioById(sid);
  const ms = missionsByScenario(sid);
  qs('#libraryGrid').innerHTML = `
    <article class="card">
      <h3>${esc(s.game_title)} · ${esc(s.age_label)} · ${esc(s.difficulty_label)}</h3>
      <p>${esc(s.hook)}</p>
      <div class="actions"><button onclick="renderLibrary()">Retour bibliothèque</button></div>
    </article>
    ${ms.map(m => `
      <article class="card">
        <div class="pillbar"><span class="pill">Mission ${m.number}</span><span class="pill">${esc(m.answer_type)}</span></div>
        <h3>${esc(m.title)}</h3>
        <p>${esc(m.summary)}</p>
      </article>
    `).join('')}
  `;
}
function renderAnimateur(){
  qs('#animateurGrid').innerHTML = MISSIONS.slice(0,220).map(m => {
    const s = scenarioById(m.scenario_id);
    return `
      <article class="card">
        <div class="pillbar">
          <span class="pill">${esc(s.game_title)}</span>
          <span class="pill">${esc(s.age_label)}</span>
          <span class="pill">Mission ${m.number}</span>
        </div>
        <h3>${esc(m.title)}</h3>
        <p><strong>Résumé :</strong> ${esc(m.summary)}</p>
        <p><strong>Réponse attendue :</strong> ${esc(m.expected_answer)}</p>
        <p><strong>Indice animateur :</strong> ${esc(m.hint)}</p>
      </article>
    `;
  }).join('');
}
init();
