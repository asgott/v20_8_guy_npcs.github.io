// ─────────────────────────────────────────────────────────────
//  VTM NPC HEALTH TRACKER
//  4-state cycle per box: 0=empty  1=slash  2=cross  3=filled
// ─────────────────────────────────────────────────────────────

const PNG_W = 1488;
const PNG_H = 2266;

// ── HEALTH CONFIG ─────────────────────────────────────────────
const CONFIG = {
  BOX_W:   24,
  BOX_H:   24,
  BOX_GAP:  4,

  NPC_GROUPS: [
    { id: 'npc1', label: 'NPC 1', top:  98,    left:  315   },
    { id: 'npc2', label: 'NPC 2', top:  98,    left:  661   },
    { id: 'npc3', label: 'NPC 3', top:  98,    left:  1006 },
    { id: 'npc4', label: 'NPC 4', top:  98,    left:  1350   },
    { id: 'npc5', label: 'NPC 5', top:  606, left:  315   },
    { id: 'npc6', label: 'NPC 6', top:  606, left:  661   },
    { id: 'npc7', label: 'NPC 7', top:  606, left:  1006 },
    { id: 'npc8', label: 'NPC 8', top:  606, left:  1350   },
  ],

  BOXES_PER_NPC: 7,
  STATES:        4,
};

// ── NAME CONFIG ───────────────────────────────────────────────
const NAME_CONFIG = {
  BOX_W:  274,
  BOX_H:   45,

  NAME_FIELDS: [
    { id: 'name1', top:  509, left:  90  },
    { id: 'name2', top:  509, left:  435 },
    { id: 'name3', top:  509, left:  781 },
    { id: 'name4', top:  509, left:  1125 },
    { id: 'name5', top:  1021, left:  90  },
    { id: 'name6', top:  1021, left:  435 },
    { id: 'name7', top:  1021, left:  781 },
    { id: 'name8', top:  1021, left:  1125 },
  ],
};

// ── DICE CONFIG ───────────────────────────────────────────────
const DICE_CONFIG = {
  POOL_BOX:       { top: 1541, left: 599,   w: 48,  h: 48 },
  POOL_BTN_MINUS: { top: 1537, left: 428,   w: 36,  h: 48 },
  POOL_BTN_PLUS:  { top: 1537, left: 790,   w: 36,  h: 48 },

  DIFF_BOX:       { top: 1540, left: 1041,   w: 48,  h: 48 },
  DIFF_BTN_UP:    { top: 1510, left: 1154,   w: 26,  h: 14 },
  DIFF_BTN_DOWN:  { top: 1585, left: 1154,   w: 26,  h: 14 },

  ROLL_BTN:       { top: 1696, left: 780,   w: 430, h: 100 },
  RESULT_BTN:     { top: 1698, left: 312, w: 430, h: 100 },
  RESULTS_AREA:   { top: 1842, left: 315,   w: 891, h: 248 },

  POOL_MIN:  1,
  POOL_MAX: 20,
  DIFF_MIN:  2,
  DIFF_MAX: 10,
};

// ── WEAPON CONFIG ─────────────────────────────────────────────
const WEAPON_CONFIG = {
  ATTACK_DIFFICULTY: 6,
  DAMAGE_DIFFICULTY: 6,

  BTN_W: 89,
  BTN_H: 89,

  WEAPONS: [
    {
      id: 'knife',   label: 'Knife',
      attackDice: 4, damageDice: 3,
      attackBtn: { top: 1212, left:  75    },
      damageBtn: { top: 1212, left:  179   },
    },
    {
      id: 'pistol',  label: 'Pistol',
      attackDice: 5, damageDice: 4,
      attackBtn: { top: 1212, left:  304   },
      damageBtn: { top: 1212, left:  408   },
    },
    {
      id: 'rifle',   label: 'Rifle',
      attackDice: 5, damageDice: 6,
      attackBtn: { top: 1212, left:  532.5 },
      damageBtn: { top: 1212, left:  636.5 },
    },
    {
      id: 'smg',     label: 'SMG',
      attackDice: 5, damageDice: 5,
      attackBtn: { top: 1212, left:  761.5   },
      damageBtn: { top: 1212, left:  865.5   },
    },
    {
      id: 'shotgun', label: 'Shotgun',
      attackDice: 5, damageDice: 7,
      attackBtn: { top: 1212, left:  990   },
      damageBtn: { top: 1212, left:  1094  },
    },
    {
      id: 'baton',   label: 'Baton',
      attackDice: 4, damageDice: 4,
      attackBtn: { top: 1212, left:  1221 },
      damageBtn: { top: 1212, left:  1325 },
    },
  ],
};

// ─────────────────────────────────────────────────────────────
//  PERCENTAGE HELPERS
// ─────────────────────────────────────────────────────────────
function px(val, axis) {
  return (val / (axis === 'x' ? PNG_W : PNG_H) * 100) + '%';
}

function makeEl(tag, cls, box) {
  const el = document.createElement(tag);
  el.classList.add(cls);
  el.style.position = 'absolute';
  el.style.top      = px(box.top, 'y');
  el.style.left     = px(box.left, 'x');
  if (box.w) el.style.width  = px(box.w, 'x');
  if (box.h) el.style.height = px(box.h, 'y');
  el.style.pointerEvents = 'all';
  return el;
}

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────
const npcStates = {};
let dicePool   = 5;
let difficulty = 6;

const pendingBonus = {};
WEAPON_CONFIG.WEAPONS.forEach(w => { pendingBonus[w.id] = 0; });

// ─────────────────────────────────────────────────────────────
//  OVERLAY
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
//  OVERLAY
// ─────────────────────────────────────────────────────────────
const overlay = document.getElementById('overlay');
const bgImg = document.getElementById('bg');

function applyScale() {
  const w = bgImg.clientWidth;
  if (w === 0) return;
  document.documentElement.style.setProperty('--scale', w / PNG_W);
}

const ro = new ResizeObserver(applyScale);
ro.observe(bgImg);

bgImg.addEventListener('load', applyScale);
window.addEventListener('load', applyScale);
setTimeout(applyScale, 0);
// ─────────────────────────────────────────────────────────────
//  BUILD: HEALTH BOXES
// ─────────────────────────────────────────────────────────────
CONFIG.NPC_GROUPS.forEach(npc => {
  npcStates[npc.id] = new Array(CONFIG.BOXES_PER_NPC).fill(0);

  const group = document.createElement('div');
  group.classList.add('npc-group');
  group.dataset.npc = npc.id;
  group.style.top  = px(npc.top,  'y');
  group.style.left = px(npc.left, 'x');

  for (let i = 0; i < CONFIG.BOXES_PER_NPC; i++) {
    const box = document.createElement('div');
    box.classList.add('health-box');
    box.dataset.state = '0';
    box.dataset.index = i;
    box.title = `${npc.label} – box ${i + 1}`;

    // ── FIX: scale width, height, and gap via px() ──

    box.addEventListener('click', () => {
      const current = npcStates[npc.id][i];
      const next    = (current + 1) % CONFIG.STATES;
      npcStates[npc.id][i] = next;
      box.dataset.state = String(next);
    });

    group.appendChild(box);
  }

  overlay.appendChild(group);
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
  input.style.top    = px(field.top,        'y');
  input.style.left   = px(field.left,       'x');
  input.style.width  = px(NAME_CONFIG.BOX_W, 'x');
  input.style.height = px(NAME_CONFIG.BOX_H, 'y');
  overlay.appendChild(input);
});

// ─────────────────────────────────────────────────────────────
//  BUILD: DICE ROLLER
// ─────────────────────────────────────────────────────────────
const poolDisplay = makeEl('div', 'dice-counter-display', DICE_CONFIG.POOL_BOX);
poolDisplay.textContent = dicePool;
overlay.appendChild(poolDisplay);

const poolMinus = makeEl('button', 'dice-tri-btn', DICE_CONFIG.POOL_BTN_MINUS);
poolMinus.innerHTML = '&#9664;';
poolMinus.title = 'Remove a die';
poolMinus.addEventListener('click', () => {
  if (dicePool > DICE_CONFIG.POOL_MIN) { dicePool--; poolDisplay.textContent = dicePool; }
});
overlay.appendChild(poolMinus);

const poolPlus = makeEl('button', 'dice-tri-btn', DICE_CONFIG.POOL_BTN_PLUS);
poolPlus.innerHTML = '&#9654;';
poolPlus.title = 'Add a die';
poolPlus.addEventListener('click', () => {
  if (dicePool < DICE_CONFIG.POOL_MAX) { dicePool++; poolDisplay.textContent = dicePool; }
});
overlay.appendChild(poolPlus);

const diffDisplay = makeEl('div', 'dice-counter-display', DICE_CONFIG.DIFF_BOX);
diffDisplay.textContent = difficulty;
overlay.appendChild(diffDisplay);

const diffUp = makeEl('button', 'dice-tri-btn', DICE_CONFIG.DIFF_BTN_UP);
diffUp.innerHTML = '&#9650;';
diffUp.title = 'Increase difficulty';
diffUp.addEventListener('click', () => {
  if (difficulty < DICE_CONFIG.DIFF_MAX) { difficulty++; diffDisplay.textContent = difficulty; }
});
overlay.appendChild(diffUp);

const diffDown = makeEl('button', 'dice-tri-btn', DICE_CONFIG.DIFF_BTN_DOWN);
diffDown.innerHTML = '&#9660;';
diffDown.title = 'Decrease difficulty';
diffDown.addEventListener('click', () => {
  if (difficulty > DICE_CONFIG.DIFF_MIN) { difficulty--; diffDisplay.textContent = difficulty; }
});
overlay.appendChild(diffDown);

const resultLabel = makeEl('div', 'dice-result-label', DICE_CONFIG.RESULT_BTN);
resultLabel.textContent = '—';
overlay.appendChild(resultLabel);

const rollBtn = makeEl('button', 'dice-roll-btn', DICE_CONFIG.ROLL_BTN);
rollBtn.textContent = 'Roll the Dice';
overlay.appendChild(rollBtn);

const resultsArea = makeEl('div', 'dice-results-area', DICE_CONFIG.RESULTS_AREA);
overlay.appendChild(resultsArea);

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
  atkBtn.style.top           = px(weapon.attackBtn.top,  'y');
  atkBtn.style.left          = px(weapon.attackBtn.left, 'x');
  atkBtn.style.width         = px(WEAPON_CONFIG.BTN_W,   'x');
  atkBtn.style.height        = px(WEAPON_CONFIG.BTN_H,   'y');
  atkBtn.style.pointerEvents = 'all';

  const dmgBtn = document.createElement('button');
  dmgBtn.classList.add('weapon-btn', 'weapon-btn--damage');
  dmgBtn.textContent = weapon.label + ' Dmg';
  dmgBtn.style.position      = 'absolute';
  dmgBtn.style.top           = px(weapon.damageBtn.top,  'y');
  dmgBtn.style.left          = px(weapon.damageBtn.left, 'x');
  dmgBtn.style.width         = px(WEAPON_CONFIG.BTN_W,   'x');
  dmgBtn.style.height        = px(WEAPON_CONFIG.BTN_H,   'y');
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

  overlay.appendChild(atkBtn);
  overlay.appendChild(dmgBtn);
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
        const group = overlay.querySelector(`[data-npc="${npcId}"]`);
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
