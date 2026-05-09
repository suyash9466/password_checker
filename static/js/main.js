const input = document.getElementById('password-input');
const toggleBtn = document.getElementById('toggle-btn');
const barFill = document.getElementById('bar-fill');
const strengthLabel = document.getElementById('strength-label');
const statsRow = document.getElementById('stats-row');
const checklistEl = document.getElementById('checklist');
const tipsBox = document.getElementById('tips-box');
const tipsList = document.getElementById('tips-list');
const sessionBadge = document.getElementById('session-badge');

const checkMeta = [
  { key: 'length_8',  label: '8+ chars' },
  { key: 'length_12', label: '12+ chars' },
  { key: 'length_16', label: '16+ chars' },
  { key: 'uppercase', label: 'Uppercase' },
  { key: 'lowercase', label: 'Lowercase' },
  { key: 'digits',    label: 'Numbers' },
  { key: 'special',   label: 'Symbols' },
  { key: 'no_repeat', label: 'No repeats' },
];

const colorMap = {
  red:        '#ff4d4d',
  orange:     '#ff8c42',
  yellow:     '#f5c518',
  lightgreen: '#62d87a',
  green:      '#22c55e',
};

let debounceTimer = null;

toggleBtn.addEventListener('click', () => {
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  toggleBtn.textContent = isPassword ? '🙈' : '👁';
});

input.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const val = input.value;

  if (!val) {
    resetUI();
    return;
  }

  debounceTimer = setTimeout(() => checkPassword(val), 200);
});

async function checkPassword(password) {
  try {
    const resp = await fetch('/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!resp.ok) return;
    const data = await resp.json();
    renderResult(data);
  } catch (err) {
    console.warn('Check failed:', err);
  }
}

function renderResult(data) {
  const pct = data.percentage;
  const color = colorMap[data.color] || '#6c63ff';

  barFill.style.width = pct + '%';
  barFill.style.backgroundColor = color;

  strengthLabel.textContent = data.strength;
  strengthLabel.style.color = color;

  document.getElementById('stat-len').textContent = data.length;
  document.getElementById('stat-score').textContent = `${data.score}/${data.max_score}`;
  document.getElementById('stat-pct').textContent = pct + '%';
  statsRow.style.display = 'flex';

  checklistEl.innerHTML = '';
  checkMeta.forEach(({ key, label }) => {
    const pass = data.checks[key];
    const item = document.createElement('div');
    item.className = 'check-item' + (pass ? ' pass' : '');
    item.innerHTML = `
      <span class="check-icon">${pass ? '✓' : ''}</span>
      <span>${label}</span>
    `;
    checklistEl.appendChild(item);
  });

  if (data.tips.length > 0) {
    tipsList.innerHTML = data.tips.map(t => `<li>${t}</li>`).join('');
    tipsBox.style.display = 'block';
  } else {
    tipsBox.style.display = 'none';
  }

  // update session badge
  if (data.session_count !== undefined) {
    sessionBadge.textContent = `Checks this session: ${data.session_count}`;
  }
}

function resetUI() {
  barFill.style.width = '0%';
  strengthLabel.textContent = '—';
  strengthLabel.style.color = '';
  statsRow.style.display = 'none';
  checklistEl.innerHTML = '';
  tipsBox.style.display = 'none';
}
