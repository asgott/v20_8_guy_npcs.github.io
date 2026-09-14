// ─────────────────────────────────────────────────────────────
//  VTM NPC HEALTH TRACKER
//  4-state cycle per box: 0=empty  1=slash  2=cross  3=filled
// ─────────────────────────────────────────────────────────────

// ── HEALTH CONFIG ─────────────────────────────────────────────
const CONFIG = {
  BOX_W:   24,
  BOX_H:   24,
  BOX_GAP:  4,

  NPC_GROUPS: [
    { id: 'npc1', label: 'NPC 1', top:  47,    left:  151   },
    { id: 'npc2', label: 'NPC 2', top:  47,    left:  315   },
    { id: 'npc3', label: 'NPC 3', top:  47,    left:  478.5 },
    { id: 'npc4', label: 'NPC 4', top:  47,    left:  642   },
    { id: 'npc5', label: 'NPC 5', top:  289.5, left:  151   },
    { id: 'npc6', label: 'NPC 6', top:  289.5, left:  315   },
    { id: 'npc7', label: 'NPC 7', top:  289.5, left:  478.5 },
    { id: 'npc8', label: 'NPC 8', top:  289.5, left:  642   },
  ],

  BOXES_PER_NPC: 7,
  STATES:        4,
};

// ── NAME CONFIG ───────────────────────────────────────────────
const NAME_CONFIG = {
  BOX_W:  130,
  BOX_H:   25,

  NAME_FIELDS: [
    { id: 'name1', top:  240, left:  43  },
    { id: 'name2', top:  240, left:  206 },
    { id: 'name3', top:  240, left:  371 },
    { id: 'name4', top:  240, left:  535 },
    { id: 'name5', top:  485, left:  43  },
    { id: 'name6', top:  485, left:  206 },
    { id: 'name7', top:  485, left:  371 },
    { id: 'name8', top:  485, left:  535 },
  ],
};

// ── DICE CONFIG ───────────────────────────────────────────────
const DICE_CONFIG = {
  POOL_BOX:       { top: 721, left: 270,   w: 48,  h: 48 },
  POOL_BTN_MINUS: { top: 717, left: 190,   w: 36,  h: 48 },
  POOL_BTN_PLUS:  { top: 717, left: 370,   w: 36,  h: 48 },

  DIFF_BOX:       { top: 720, left: 482,   w: 48,  h: 48 },
  DIFF_BTN_UP:    { top: 710, left: 540,   w: 26,  h: 14 },
  DIFF_BTN_DOWN:  { top: 751, left: 540,   w: 26,  h: 14 },

  ROLL_BTN:       { top: 808, left: 370,   w: 200, h: 44 },
  RESULT_BTN:     { top: 805, left: 150.5, w: 200, h: 49 },
  RESULTS_AREA:   { top: 871, left: 161,   w: 422, h: 115 },

  POOL_MIN:  1,
  POOL_MAX: 20,
  DIFF_MIN:  2,
  DIFF_MAX: 10,
};

// ── WEAPON CONFIG ─────────────────────────────────────────────
const WEAPON_CONFIG = {
  ATTACK_DIFFICULTY: 6,
  DAMAGE_DIFFICULTY: 6,

  BTN_W: 45,
  BTN_H: 45,

  WEAPONS: [
    {
      id: 'knife',   label: 'Knife',
      attackDice: 4, damageDice: 3,
      attackBtn: { top: 574, left:  34    },
      damageBtn: { top: 574, left:  84    },
    },
    {
      id: 'pistol',  label: 'Pistol',
      attackDice: 5, damageDice: 4,
      attackBtn: { top: 574, left:  143   },
      damageBtn: { top: 574, left:  192   },
    },
    {
      id: 'rifle',   label: 'Rifle',
      attackDice: 5, damageDice: 6,
      attackBtn: { top: 574, left:  251.5 },
      damageBtn: { top: 574, left:  301   },
    },
    {
      id: 'smg',     label: 'SMG',
      attackDice: 5, damageDice: 5,
      attackBtn: { top: 574, left:  360   },
      damageBtn: { top: 574, left:  410   },
    },
    {
      id: 'shotgun', label: 'Shotgun',
      attackDice: 5, damageDice: 7,
      attackBtn: { top: 574, left:  469   },
      damageBtn: { top: 574, left:  519   },
    },
    {
      id: 'baton',   label: 'Baton',
      attackDice: 4, damageDice: 4,
      attackBtn: { top: 574, left:  578.5 },
      damageBtn: { top: 574, left:  628   },
    },
  ],
};

// ─────────────────────────────────────────────────────────────
//  CSS VARIABLES
// ─────────────────────────────────────────────────────────────
document.documentElement.style.setProperty('--box-w',   CONFIG.BOX_W   + 'px');
document.documentElement.style.setProperty('--box-h',   CONFIG.BOX_H   + 'px');
document.documentElement.style.setProperty('--box-gap', CONFIG.BOX_GAP + 'px');

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────
const npcStates = {};
let dicePool   = 5;
let difficulty = 6;

const pendingBonus = {};
WEAPON_CONFIG.WEAPONS.forEach(w => { pendingBonus[w.id] = 0; });

// ─────────────────────────────────────────────────────────────
//  OVERLAY + SCALE ROOT
// ─────────────────────────────────────────────────────────────
const overlay = document.getElementById('overlay');

const scaleRoot = document.createElement('div');
scaleRoot.id = 'scale-root';
overlay.appendChild(scaleRoot);  // scaleRoot goes INTO overlay, not into itself

function applyScale() {
  const scale = overlay.offsetWidth / 1488;
  scaleRoot.style.transform = `scale(${scale})`;
  // Force overlay to match the scaled height so it doesn't overflow
  overlay.style.height = (2266 * scale) + 'px';
}
applyScale();
window.addEventListener('resize', applyScale);

// ── Helper ────────────────────────────────────────────────────
function makeEl(tag, cls, box) {
  const el = document.createElement(tag);
  el.classList.add(cls);
  el.style.position = 'absolute';
  el.style.top      = box.top  + 'px';
  el.style.left     = box.left + 'px';
  if (box.w) el.style.width  = box.w + 'px';
  if (box.h) el.style.height = box.h + 'px';
  el.style.pointerEvents = 'all';
  return el;
}

// ─────────────────────────────────────────────────────────────
//  BUILD: HEALTH BOXES
// ─────────────────────────────────────────────────────────────
CONFIG.NPC_GROUPS.forEach(npc => {
  npcStates[npc.id] = new Array(CONFIG.BOXES_PER_NPC).fill(0);

  const group = document.createElement('div');
  group.classList.add('npc-group');
  group.dataset.npc = npc.id;
  group.style.top  = npc.top  + 'px';
  group.style.left = npc.left + 'px';

  for (let i = 0; i < CONFIG.BOXES_PER_NPC; i++) {
    const box = document.createElement('div');
    box.classList.add('health-box');
    box.dataset.state = '0';
    box.dataset.index = i;
    box.title = `${npc.label} – box ${i + 1}`;

    box.addEventListener('click', () => {
      const current = npcStates[npc.id][i];
      const next    = (current + 1) % CONFIG.STATES;
      npcStates[npc.id][i] = next;
      box.dataset.state = String(next);
    });

    group.appendChild(box);
  }

  scaleRoot.appendChild(group);
});

// ─────────────────────────────────────────────────────────────
//  BUILD: NAME FIELDS
// ─────────────────────────────────────────────────────────────
NAME_CONFIG.NAME_FIELDS.forEach(field => {
  const input = document.createElement('input');
  input.type = 'text';
  input.classList.add('npc-name');
  input.dataset.id = field.id;
  input.placeholder = '—';
  input.style.top    = field.top    + 'px';
  input.style.left   = field.left   + 'px';
  input.style.width  = NAME_CONFIG.BOX_W + 'px';
  input.style.height = NAME_CONFIG.BOX_H + 'px';
  scaleRoot.appendChild(input);
});

// ─────────────────────────────────────────────────────────────
//  BUILD: DICE ROLLER
// ─────────────────────────────────────────────────────────────
const poolDisplay = makeEl('div', 'dice-counter-display', DICE_CONFIG.POOL_BOX);
poolDisplay.textContent = dicePool;
scaleRoot.appendChild(poolDisplay);

const poolMinus = makeEl('button', 'dice-tri-btn', DICE_CONFIG.POOL_BTN_MINUS);
poolMinus.innerHTML = '&#9664;';
poolMinus.title = 'Remove a die';
poolMinus.addEventListener('click', () => {
  if (dicePool > DICE_CONFIG.POOL_MIN) { dicePool--; poolDisplay.textContent = dicePool; }
});
scaleRoot.appendChild(poolMinus);

const poolPlus = makeEl('button', 'dice-tri-btn', DICE_CONFIG.POOL_BTN_PLUS);
poolPlus.innerHTML = '&#9654;';
poolPlus.title = 'Add a die';
poolPlus.addEventListener('click', () => {
  if (dicePool < DICE_CONFIG.POOL_MAX) { dicePool++; poolDisplay.textContent = dicePool; }
});
scaleRoot.appendChild(poolPlus);

const diffDisplay = makeEl('div', 'dice-counter-display', DICE_CONFIG.DIFF_BOX);
diffDisplay.textContent = difficulty;
scaleRoot.appendChild(diffDisplay);

const diffUp = makeEl('button', 'dice-tri-btn', DICE_CONFIG.DIFF_BTN_UP);
diffUp.innerHTML = '&#9650;';
diffUp.title = 'Increase difficulty';
diffUp.addEventListener('click', () => {
  if (difficulty < DICE_CONFIG.DIFF_MAX) { difficulty++; diffDisplay.textContent = difficulty; }
});
scaleRoot.appendChild(diffUp);

const diffDown = makeEl('button', 'dice-tri-btn', DICE_CONFIG.DIFF_BTN_DOWN);
diffDown.innerHTML = '&#9660;';
diffDown.title = 'Decrease difficulty';
diffDown.addEventListener('click', () => {
  if (difficulty > DICE_CONFIG.DIFF_MIN) { difficulty--; diffDisplay.textContent = difficulty; }
});
scaleRoot.appendChild(diffDown);

const resultLabel = makeEl('div', 'dice-result-label', DICE_CONFIG.RESULT_BTN);
resultLabel.textContent = '—';
scaleRoot.appendChild(resultLabel);

const rollBtn = makeEl('button', 'dice-roll-btn', DICE_CONFIG.ROLL_BTN);
rollBtn.textContent = 'Roll the Dice';
scaleRoot.appendChild(rollBtn);

const resultsArea = makeEl('div', 'dice-results-area', DICE_CONFIG.RESULTS_AREA);
scaleRoot.appendChild(resultsArea);

// ─────────────────────────────────────────────────────────────
//  ROLL LOGIC
// ─────────────────────────────────────────────────────────────
function renderDice(results) {
  resultsArea.innerHTML = '';
  results.forEach(({ roll, type }) => {
    const die   = document.createElement('div');
    die.classList.add('die', `die--${type}`);
    const inner = document.createElement('div');
    inner.classList.add('die-inner');
    const span  = document.createElement('span');
    span.textContent = roll;
    inner.appendChild(span);
    die.appendChild(inner);
    resultsArea.appendChild(die);
  });
}

function calcResults(numDice, diff) {
  let netSuccesses = 0;
  const results = [];

  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * 10) + 1;
    let type;

    if (roll === 1)          type = 'critfail';
    else if (roll === 10)    type = 'critsuccess';
    else if (roll >= diff)   type = 'success';
    else                     type = 'failure';

    if (type === 'critsuccess')   netSuccesses += 2;
    else if (type === 'success')  netSuccesses += 1;
    else if (type === 'critfail') netSuccesses -= 1;

    results.push({ roll, type });
  }
  return { results, netSuccesses };
}

function updateResultLabel(netSuccesses) {
  if (netSuccesses >= 1) {
    resultLabel.textContent     = `${netSuccesses} success${netSuccesses > 1 ? 'es' : ''}`;
    resultLabel.dataset.outcome = 'success';
  } else if (netSuccesses === 0) {
    resultLabel.textContent     = 'Failure';
    resultLabel.dataset.outcome = 'failure';
  } else {
    resultLabel.textContent     = 'Botch!';
    resultLabel.dataset.outcome = 'botch';
  }
}

function rollDice() {
  const { results, netSuccesses } = calcResults(dicePool, difficulty);
  renderDice(results);
  updateResultLabel(netSuccesses);
}

function rollWeaponDice(numDice, difficultyOverride) {
  const diff = difficultyOverride ?? difficulty;
  const { results, netSuccesses } = calcResults(numDice, diff);
  renderDice(results);
  updateResultLabel(netSuccesses);
  return netSuccesses;
}

rollBtn.addEventListener('click', rollDice);

// ─────────────────────────────────────────────────────────────
//  BUILD: WEAPON BUTTONS
// ─────────────────────────────────────────────────────────────
WEAPON_CONFIG.WEAPONS.forEach(weapon => {
  const atkBtn = document.createElement('button');
  atkBtn.classList.add('weapon-btn', 'weapon-btn--attack');
  atkBtn.textContent = weapon.label + ' Atk';
  atkBtn.style.position      = 'absolute';
  atkBtn.style.top           = weapon.attackBtn.top  + 'px';
  atkBtn.style.left          = weapon.attackBtn.left + 'px';
  atkBtn.style.width         = WEAPON_CONFIG.BTN_W   + 'px';
  atkBtn.style.height        = WEAPON_CONFIG.BTN_H   + 'px';
  atkBtn.style.pointerEvents = 'all';

  const dmgBtn = document.createElement('button');
  dmgBtn.classList.add('weapon-btn', 'weapon-btn--damage');
  dmgBtn.textContent = weapon.label + ' Dmg';
  dmgBtn.style.position      = 'absolute';
  dmgBtn.style.top           = weapon.damageBtn.top  + 'px';
  dmgBtn.style.left          = weapon.damageBtn.left + 'px';
  dmgBtn.style.width         = WEAPON_CONFIG.BTN_W   + 'px';
  dmgBtn.style.height        = WEAPON_CONFIG.BTN_H   + 'px';
  dmgBtn.style.pointerEvents = 'all';

  atkBtn.addEventListener('click', () => {
    const net = rollWeaponDice(weapon.attackDice, WEAPON_CONFIG.ATTACK_DIFFICULTY);
    pendingBonus[weapon.id] = Math.max(0, net - 1);
    dmgBtn.classList.toggle('weapon-btn--bonus', pendingBonus[weapon.id] > 0);
  });

  dmgBtn.addEventListener('click', () => {
    const totalDice = weapon.damageDice + pendingBonus[weapon.id];
    rollWeaponDice(totalDice, WEAPON_CONFIG.DAMAGE_DIFFICULTY);
    pendingBonus[weapon.id] = 0;
    dmgBtn.classList.remove('weapon-btn--bonus');
  });

  scaleRoot.appendChild(atkBtn);
  scaleRoot.appendChild(dmgBtn);
});

// ─────────────────────────────────────────────────────────────
//  LOCAL STORAGE
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'vtm-npc-tracker';

function saveState() {
  const names = {};
  document.querySelectorAll('.npc-name').forEach(input => {
    names[input.dataset.id] = input.value;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    health:     npcStates,
    names,
    dicePool,
    difficulty,
  }));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  let state;
  try { state = JSON.parse(raw); } catch { return; }

  if (state.health) {
    Object.entries(state.health).forEach(([npcId, boxes]) => {
      if (!npcStates[npcId]) return;
      boxes.forEach((val, i) => {
        npcStates[npcId][i] = val;
        const group = scaleRoot.querySelector(`[data-npc="${npcId}"]`);
        if (group) {
          const box = group.querySelectorAll('.health-box')[i];
          if (box) box.dataset.state = String(val);
        }
      });
    });
  }

  if (state.names) {
    document.querySelectorAll('.npc-name').forEach(input => {
      if (state.names[input.dataset.id] !== undefined) {
        input.value = state.names[input.dataset.id];
      }
    });
  }

  if (state.dicePool !== undefined) {
    dicePool = state.dicePool;
    poolDisplay.textContent = dicePool;
  }
  if (state.difficulty !== undefined) {
    difficulty = state.difficulty;
    diffDisplay.textContent = difficulty;
  }
}

document.addEventListener('click', saveState);
document.querySelectorAll('.npc-name').forEach(input => {
  input.addEventListener('input', saveState);
});

loadState();

// TEMPORARY DEBUG — remove when done
const debugEl = document.createElement('div');
debugEl.style.cssText = `
  position: fixed; bottom: 10px; left: 10px; z-index: 9999;
  background: rgba(0,0,0,0.8); color: lime; font-size: 13px;
  font-family: monospace; padding: 6px 10px; border-radius: 4px;
`;
document.body.appendChild(debugEl);

function updateDebug() {
  const imgEl = document.getElementById('bg');
  debugEl.textContent =
    `overlay px width: ${overlay.offsetWidth} | ` +
    `img natural: ${imgEl.naturalWidth}×${imgEl.naturalHeight} | ` +
    `scale: ${(overlay.offsetWidth / imgEl.naturalWidth).toFixed(4)}`;
}
updateDebug();
window.addEventListener('resize', updateDebug);
