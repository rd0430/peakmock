const state = {
  token: localStorage.getItem('peakmock_token') || null,
  user: null,
  theme: localStorage.getItem('peakmock_theme') || 'light',
  authMode: 'login',
  tests: [],
  history: [],
  activeTimer: null,
  timerSecondsLeft: 0,
  timerElapsed: 0
};

async function apiFetch(url, options = {}) {
  const headers = options.headers || {};
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Server xatoligi (${res.status})`);
  return data;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractOptCode(opt) {
  const s = String(opt || '').trim();
  if (/^(TRUE|FALSE|NOT GIVEN|YES|NO)$/i.test(s)) return s.toUpperCase();
  const m = s.match(/^([A-Ha-h]|[ivxIVX]{1,4})(?:[.):]\s+|\s+)/);
  if (m) return m[1].trim();
  if (s.includes('.')) return s.split('.')[0].trim();
  return s;
}

function getQuestionMaxSelect(q) {
  if (q.maxSelect && Number(q.maxSelect) > 1) return Number(q.maxSelect);
  if (Array.isArray(q.answer) && q.answer.length > 1) return q.answer.length;

  const ansStr = String(q.answer || '').trim();
  if (/^[A-Ha-h](\s*[,/&]\s*|\s+and\s+)[A-Ha-h]$/i.test(ansStr)) {
    return ansStr.split(/\s*[,/&]\s*|\s+and\s+/i).length;
  }

  const promptText = String(q.prompt || q.question || '');
  const hasManyOpts = Array.isArray(q.options) && q.options.length >= 4;
  if (hasManyOpts) {
    if (/\b(TWO|2)\b/i.test(promptText)) return 2;
    if (/\b(THREE|3)\b/i.test(promptText)) return 3;
    if (/\b(FOUR|4)\b/i.test(promptText)) return 4;
  }
  return 1;
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  return new Date(isoStr).toLocaleString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatClock(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function clearActiveTimer() {
  if (state.activeTimer) {
    clearInterval(state.activeTimer);
    state.activeTimer = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (window._stopSpeakingRecord) {
    try { window._stopSpeakingRecord(true); } catch (e) {}
  }
}

function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('peakmock_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  if (label) label.textContent = theme === 'dark' ? 'Kun rejimi' : 'Tun rejimi';
}

document.getElementById('themeToggleBtn').addEventListener('click', () => {
  applyTheme(state.theme === 'light' ? 'dark' : 'light');
});

function openModal(html) {
  document.getElementById('genericModalContent').innerHTML = html;
  document.getElementById('genericModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('genericModal').classList.add('hidden');
}

document.getElementById('genericModal').addEventListener('click', (e) => {
  if (e.target.id === 'genericModal') closeModal();
});

document.addEventListener('click', () => {
  const dd = document.getElementById('ieltsPartDropdown');
  if (dd && !dd.classList.contains('hidden')) dd.classList.add('hidden');
});

// ==================== IMTIHON PAYTIDA MENYULARNI YASHIRISH VA TO'LIQ EKRAN ====================
function enterExamMode() {
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.display = 'none';

  document.querySelectorAll('.fixed-sidebar').forEach(sb => sb.style.display = 'none');

  document.querySelectorAll('.workspace-layout').forEach(wl => {
    wl.style.marginTop = '0';
    wl.style.paddingTop = '0';
    wl.style.minHeight = '100vh';
    wl.style.display = 'block';
  });

  document.querySelectorAll('.workspace-main').forEach(wm => {
    wm.style.marginLeft = '0';
    wm.style.marginTop = '0';
    wm.style.maxWidth = '100%';
    wm.style.width = '100%';
    wm.style.minHeight = '100vh';
    wm.style.padding = '10px 14px';
  });

  if (!document.getElementById('examFullscreenStyle')) {
    const st = document.createElement('style');
    st.id = 'examFullscreenStyle';
    st.textContent = `
      body { padding-top: 0 !important; margin-top: 0 !important; }
      .timer-banner { margin-top: 0 !important; margin-bottom: 10px !important; }
      .split-exam-grid { height: calc(100vh - 78px) !important; min-height: 500px; }
      .passage-box, .questions-box { height: 100% !important; max-height: none !important; overflow-y: auto !important; }
      .bluebook-shell { height: calc(100vh - 20px) !important; }
    `;
    document.head.appendChild(st);
  }
}

function exitExamMode() {
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.display = '';

  document.querySelectorAll('.fixed-sidebar').forEach(sb => sb.style.display = '');

  document.querySelectorAll('.workspace-layout').forEach(wl => {
    wl.style.marginTop = '';
    wl.style.paddingTop = '';
    wl.style.minHeight = '';
    wl.style.display = '';
  });

  document.querySelectorAll('.workspace-main').forEach(wm => {
    wm.style.marginLeft = '';
    wm.style.marginTop = '';
    wm.style.maxWidth = '';
    wm.style.width = '';
    wm.style.minHeight = '';
    wm.style.padding = '';
  });

  const st = document.getElementById('examFullscreenStyle');
  if (st) st.remove();
}

// ==================== AUTH ====================
document.getElementById('tabLoginBtn').addEventListener('click', () => {
  state.authMode = 'login';
  document.getElementById('tabLoginBtn').classList.add('active');
  document.getElementById('tabRegisterBtn').classList.remove('active');
  document.getElementById('regNameGroup').classList.add('hidden');
  document.getElementById('authSubmitBtn').textContent = 'Tizimga kirish';
});

<form id="registerForm" class="auth-form">
  <h2>Ro‘yxatdan o‘tish</h2>
  <div class="input-group">
    <label>To‘liq ism-familiya</label>
    <input type="text" id="registerName" required placeholder="Ismingizni kiriting" />
  </div>
  <div class="input-group">
    <label>Elektron pochta (Email)</label>
    <input type="email" id="registerEmail" required placeholder="email@example.com" />
  </div>
  <div class="input-group">
    <label>Parol</label>
    <input type="password" id="registerPassword" required placeholder="Parol kiriting (min 6 ta belgi)" />
  </div>
  <button type="submit" class="submit-btn">Ro‘yxatdan o‘tish</button>
</form>

document.getElementById('tabRegisterBtn').addEventListener('click', () => {
  state.authMode = 'register';
  document.getElementById('tabRegisterBtn').classList.add('active');
  document.getElementById('tabLoginBtn').classList.remove('active');
  document.getElementById('regNameGroup').classList.remove('hidden');
  document.getElementById('authSubmitBtn').textContent = 'Ro‘yxatdan o‘tish';
});

document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errBox = document.getElementById('authErrorBox');
  errBox.classList.add('hidden');
  try {
    const endpoint = state.authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = state.authMode === 'register' ? {
      name: document.getElementById('authNameInput').value,
      email: document.getElementById('authEmailInput').value,
      password: document.getElementById('authPasswordInput').value
    } : {
      email: document.getElementById('authEmailInput').value,
      password: document.getElementById('authPasswordInput').value
    };
    const data = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
    handleLoginSuccess(data.token, data.user);
  } catch (err) {
    errBox.textContent = err.message;
    errBox.classList.remove('hidden');
  }
});

// Google Client ID ni shu yerga yozing (Google Cloud Console'dan olingan)
const GOOGLE_CLIENT_ID = '827268717463-6v6hc1tmug9ld5jq07auog7m344qva91.apps.googleusercontent.com';

document.getElementById('googleSsoBtn').addEventListener('click', () => {
  if (!window.google) {
    alert('Google sign-in kutubxonasi yuklanmadi. Internet aloqasini tekshiring.');
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response) => {
      try {
        // JWT tokenni decode qilish (Google foydalanuvchi ma'lumotlarini olish uchun)
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const googleUser = JSON.parse(jsonPayload);

        // Backendga yuborish
        const data = await apiFetch('/api/auth/google', {
          method: 'POST',
          body: JSON.stringify({
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.sub
          })
        });

        handleLoginSuccess(data.token, data.user);
      } catch (err) {
        alert('Google orqali kirish xatoligi: ' + err.message);
      }
    }
  });

  // Google One Tap yoki popup oynasini chiqarish
  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // Agar One Tap yopilsa, standart sign-in oynasini chaqirish mumkin
      google.accounts.id.renderButton(
        document.getElementById('googleSsoBtn'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  });
});

document.getElementById('googleSsoBtn').addEventListener('click', () => promptOAuthModal('google'));

async function handleLoginSuccess(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('peakmock_token', token);
  updateShellForUser();
  await refreshAllData();
  navigateTo('hub');
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  clearActiveTimer();
  exitExamMode();
  state.token = null;
  state.user = null;
  localStorage.removeItem('peakmock_token');
  document.getElementById('mainNav').classList.add('hidden');
  document.getElementById('logoutBtn').classList.add('hidden');
  document.getElementById('adminNavBtn').classList.add('hidden');
  hideAllViews();
  document.getElementById('authView').classList.remove('hidden');
});

function updateShellForUser() {
  if (!state.user) return;
  document.getElementById('mainNav').classList.remove('hidden');
  document.getElementById('logoutBtn').classList.remove('hidden');
  document.getElementById('hubWelcomeTitle').textContent = `Xush kelibsiz, ${state.user.name}!`;
  if (state.user.isAdmin || state.user.email.toLowerCase() === 'rozimatovdoniyor4@gmail.com') {
    document.getElementById('adminNavBtn').classList.remove('hidden');
  } else {
    document.getElementById('adminNavBtn').classList.add('hidden');
  }
}

async function refreshAllData() {
  try {
    const [testsRes, histRes] = await Promise.all([apiFetch('/api/tests'), apiFetch('/api/history')]);
    state.tests = testsRes.tests || [];
    state.history = histRes.history || [];
  } catch (e) {}
}

function hideAllViews() {
  ['authView', 'hubView', 'ieltsView', 'satView', 'profileView', 'adminView'].forEach((id) => {
    document.getElementById(id).classList.add('hidden');
  });
}

function navigateTo(route) {
  if (!state.user) {
    hideAllViews();
    document.getElementById('authView').classList.remove('hidden');
    return;
  }
  clearActiveTimer();
  exitExamMode();
  hideAllViews();
  document.querySelectorAll('.nav-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.route === route));

  if (route === 'hub') {
    document.getElementById('hubView').classList.remove('hidden');
    renderHubHistory();
  } else if (route === 'ielts') {
    document.getElementById('ieltsView').classList.remove('hidden');
    renderIeltsOverview();
  } else if (route === 'sat') {
    document.getElementById('satView').classList.remove('hidden');
    renderSatOverview();
  } else if (route === 'profile') {
    document.getElementById('profileView').classList.remove('hidden');
    renderProfileView();
  } else if (route === 'admin') {
    document.getElementById('adminView').classList.remove('hidden');
    setupAdminDropdowns();
    renderAdminTestsTable();
  }
}

document.querySelectorAll('.nav-btn').forEach((btn) => btn.addEventListener('click', () => navigateTo(btn.dataset.route)));
document.getElementById('brandHomeBtn').addEventListener('click', () => {
  if (state.user) navigateTo('hub');
});

function toggleSidebarGroup(groupId) {
  document.getElementById(groupId).classList.toggle('open');
}

function buildHistoryTableHtml(items) {
  if (!items || items.length === 0) return `<p style="color: var(--text-muted);">Hozircha natijalar yo‘q.</p>`;
  const rows = items.map((h) => `
    <tr>
      <td><strong>${escapeHtml(formatDate(h.completedAt))}</strong></td>
      <td><span class="exam-tag ${h.exam === 'SAT' ? 'tag-sat' : 'tag-ielts'}" style="margin:0;">${escapeHtml(h.exam)}</span></td>
      <td>${escapeHtml(h.section)} — ${escapeHtml(h.part)}</td>
      <td><strong style="color: var(--accent-primary);">${escapeHtml(h.scoreDisplay)}</strong></td>
      <td>${h.feedback ? `<button class="btn btn-outline btn-sm" onclick='showSavedFeedbackModal("${escapeHtml(h.id)}")'>Tahlil</button>` : 'Tugallandi'}</td>
    </tr>
  `).join('');
  return `<div style="overflow-x: auto;"><table class="data-table"><thead><tr><th>Sana</th><th>Imtihon</th><th>Bo‘lim</th><th>Natija</th><th>Amal</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function showSavedFeedbackModal(histId) {
  const item = state.history.find((h) => h.id === histId);
  if (!item || !item.feedback) return;
  openModal(`
    <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px;">${escapeHtml(item.title)}</h3>
    <div style="white-space: pre-wrap; font-size: 0.92rem; background: var(--bg-subtle); padding: 16px; border-radius: 8px; max-height: 60vh; overflow-y: auto;">${escapeHtml(item.feedback)}</div>
    <div style="text-align: right; margin-top: 16px;"><button class="btn btn-primary" onclick="closeModal()">Yopish</button></div>
  `);
}

function showTestResultModal({ title, total, correct, wrong, details }) {
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  const detailsHtml = details.map((d, i) => `
    <div style="
      padding: 12px 14px;
      border-radius: 8px;
      margin-bottom: 10px;
      border: 1px solid ${d.isCorrect ? 'var(--success)' : 'var(--danger)'};
      background: ${d.isCorrect ? 'var(--success-soft)' : 'var(--danger-soft)'};
    ">
      <div style="font-weight: 700; margin-bottom: 4px; color: var(--text-primary);">
        ${i + 1}. ${escapeHtml(d.prompt)}
      </div>
      <div style="font-size: 0.88rem; display: flex; flex-wrap: wrap; gap: 14px;">
        <span>Sizning javobingiz: <strong>${escapeHtml(d.userAnswer || 'Belgilamagan')}</strong> ${d.isCorrect ? '✅' : '❌'}</span>
        ${!d.isCorrect ? `<span>To‘g‘ri javob: <strong style="color: var(--success);">${escapeHtml(d.correctAnswer)}</strong></span>` : ''}
      </div>
      ${d.explanation ? `<div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">💡 ${escapeHtml(d.explanation)}</div>` : ''}
    </div>
  `).join('');

  openModal(`
    <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 4px;">Test Natijasi</h2>
    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 14px;">${escapeHtml(title)}</p>

    <div class="band-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 16px;">
      <div class="band-box" style="border-color: var(--success);">
        <div class="val" style="color: var(--success);">${correct}</div>
        <div class="lbl">To‘g‘ri</div>
      </div>
      <div class="band-box" style="border-color: var(--danger);">
        <div class="val" style="color: var(--danger);">${wrong}</div>
        <div class="lbl">Xato</div>
      </div>
      <div class="band-box">
        <div class="val">${percent}%</div>
        <div class="lbl">${correct} / ${total}</div>
      </div>
    </div>

    ${details.length > 0 ? `
      <div style="font-weight: 700; font-size: 0.92rem; margin-bottom: 8px;">Savollar bo‘yicha tahlil:</div>
      <div style="max-height: 45vh; overflow-y: auto; padding-right: 4px;">
        ${detailsHtml}
      </div>
    ` : ''}

    <div style="text-align: right; margin-top: 16px;">
      <button type="button" class="btn btn-primary" onclick="closeModal()">Tushunarli</button>
    </div>
  `);
}

function renderHubHistory() {
  document.getElementById('hubHistoryTableWrap').innerHTML = buildHistoryTableHtml(state.history.slice(0, 6));
}

// ==================== TAKE TEST KARTOCHKALARI GRIDI ====================
function buildTestCardsGridHtml(testsList, examType) {
  if (!testsList || testsList.length === 0) {
    return `<p style="color: var(--text-muted); margin-top: 12px;">Hozircha bu bo‘limda testlar mavjud emas.</p>`;
  }

  return `
    <div class="test-cards-grid">
      ${testsList.map(t => {
        const completed = state.history.some(h => h.title === t.title || (h.section === t.section && h.part === t.part));
        const pct = completed ? 100 : 0;
        const startCall = examType === 'SAT'
          ? `window._launchSatTestById('${escapeHtml(t.id)}')`
          : `window._launchIeltsTestById('${escapeHtml(t.id)}')`;

        const rawDate = t.createdAt || t.addedAt || t.date;
        const addedDateText = rawDate ? formatDate(rawDate) : 'Asosiy baza';

        return `
          <div class="pm-test-card">
            <div class="pm-card-badge">P</div>
            <div class="pm-card-title" style="margin-bottom: 6px;">${escapeHtml(t.title || `${t.section} — ${t.part}`)}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 14px;">
              📅 ${escapeHtml(addedDateText)}
            </div>
            <div class="pm-progress-ring ${pct > 0 ? 'done' : ''}">${pct}%</div>
            <button type="button" class="pm-take-btn" onclick="${startCall}">
              <span>⚡</span>
              <span>Take Test</span>
            </button>
            <div class="pm-card-actions">
              <button type="button" class="pm-circle-icon-btn" title="Practice rejimida ishlash" onclick="${startCall}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/></svg>
              </button>
              <button type="button" class="pm-circle-icon-btn" title="Natijalar tarixi" onclick="${examType === 'SAT' ? 'renderSatHistoryView()' : 'renderIeltsHistoryView()'}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="14" r="3"/><polyline points="12 13 12 14 13 15"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window._launchIeltsTestById = (id) => {
  const t = state.tests.find(x => x.id === id);
  if (!t) return;
  launchIeltsSession({
    mode: 'Practice',
    title: `${t.section} — ${t.part}`,
    tests: [t],
    totalMinutes: t.durationMinutes || 20
  });
};

window._launchSatTestById = (id) => {
  const mod = state.tests.find(x => x.id === id);
  if (!mod) return;
  launchBluebookEngine({
    mode: 'Practice',
    section: mod.section,
    part: mod.part,
    title: mod.title,
    questions: mod.questions || [],
    minutes: mod.durationMinutes || 32
  });
};

// ==================== IELTS ====================
function renderIeltsOverview() {
  const ieltsTests = state.tests.filter(t => t.exam === 'IELTS');
  document.getElementById('ieltsWorkspaceContent').innerHTML = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <span class="exam-tag tag-ielts">IELTS Academic</span>
          <h1 style="font-size: 1.55rem; font-weight: 800;">Barcha IELTS Testlari</h1>
        </div>
        <button class="btn btn-primary" onclick="openIeltsStrictMockHub()">Strict Mock boshlash</button>
      </div>
      ${buildTestCardsGridHtml(ieltsTests, 'IELTS')}
    </div>
  `;
}

function renderIeltsHistoryView() {
  document.getElementById('ieltsWorkspaceContent').innerHTML = `<div class="card"><h2>IELTS Tarixi</h2>${buildHistoryTableHtml(state.history.filter(h => h.exam === 'IELTS'))}</div>`;
}

function startIeltsPart(section, part) {
  const matched = state.tests.filter(x => x.exam === 'IELTS' && x.section === section && x.part === part);
  if (matched.length === 0) {
    alert('Test topilmadi.');
    return;
  }
  document.getElementById('ieltsWorkspaceContent').innerHTML = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <span class="exam-tag tag-ielts">IELTS ${escapeHtml(section)}</span>
          <h2 style="font-size: 1.4rem; font-weight: 800;">${escapeHtml(section)} — ${escapeHtml(part)}</h2>
        </div>
        <button class="btn btn-outline btn-sm" onclick="renderIeltsOverview()">← Barcha testlar</button>
      </div>
      ${buildTestCardsGridHtml(matched, 'IELTS')}
    </div>
  `;
}

function openIeltsStrictMockHub() {
  document.getElementById('ieltsWorkspaceContent').innerHTML = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
        <div>
          <span class="strict-badge">Strict Mock</span>
          <h2 style="font-size: 1.45rem; font-weight: 800; margin-top: 6px;">IELTS Strict Mock</h2>
        </div>
        <button class="btn btn-outline btn-sm" onclick="renderIeltsOverview()">← Orqaga</button>
      </div>

      <!-- HAMMASI 1TADA FULL MOCK -->
      <div class="card" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; border: none; margin-bottom: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <span class="exam-tag" style="background: rgba(255,255,255,0.16); color: #ffffff; margin-bottom: 8px;">To‘liq Imtihon Simulyatori</span>
            <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 6px;">Full IELTS Mock (Hammasi 1tada)</h3>
            <p style="color: #cbd5e1; font-size: 0.9rem; max-width: 600px;">
              Listening + Reading + Writing + Speaking — barcha 4 bo‘lim ketma-ket bitta yagona imtihon sessiyasida.
            </p>
          </div>
          <button type="button" class="btn" style="background: #ffffff; color: #0f172a; font-weight: 800; padding: 12px 22px;" onclick="launchIeltsFullAllMock()">
            ⚡ To‘liq Mockni Boshlash (165m)
          </button>
        </div>
      </div>

      <!-- ALOHIDA BO'LIMLAR -->
      <div class="exam-grid" style="margin-bottom: 0;">
        <div class="card" style="margin:0;">
          <h3 style="margin-bottom: 6px;">Listening Full Mock</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 14px;">Barcha Listening qismlari (Part 1–4)</p>
          <button type="button" class="btn btn-primary" onclick="launchIeltsStrictSection('Listening', 30)">Boshlash (30m)</button>
        </div>

        <div class="card" style="margin:0;">
          <h3 style="margin-bottom: 6px;">Reading Full Mock</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 14px;">Barcha Reading matnlari (Passage 1–3)</p>
          <button type="button" class="btn btn-primary" onclick="launchIeltsStrictSection('Reading', 60)">Boshlash (60m)</button>
        </div>

        <div class="card" style="margin:0;">
          <h3 style="margin-bottom: 6px;">Writing Full Mock</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 14px;">Task 1 va Task 2 insho simulyatori</p>
          <button type="button" class="btn btn-primary" onclick="launchIeltsStrictSection('Writing', 60)">Boshlash (60m)</button>
        </div>

        <div class="card" style="margin:0;">
          <h3 style="margin-bottom: 6px;">Speaking Full Mock</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 14px;">Part 1, Part 2 va Part 3 savollari</p>
          <button type="button" class="btn btn-primary" onclick="launchIeltsStrictSection('Speaking', 15)">Boshlash (15m)</button>
        </div>
      </div>
    </div>
  `;
}

function launchIeltsFullAllMock() {
  const order = ['Listening', 'Reading', 'Writing', 'Speaking'];
  const allTests = order.flatMap(sec =>
    state.tests.filter(t => t.exam === 'IELTS' && t.section === sec)
  );

  if (allTests.length === 0) {
    alert('Bazadan IELTS testlari topilmadi.');
    return;
  }

  launchIeltsSession({
    mode: 'Strict Mock',
    title: 'Full IELTS Mock (All 4 Sections)',
    tests: allTests,
    totalMinutes: 165
  });
}

function launchIeltsStrictSection(section, minutes) {
  const tests = state.tests.filter((t) => t.exam === 'IELTS' && t.section === section);
  if (tests.length === 0) {
    alert('Testlar topilmadi.');
    return;
  }
  launchIeltsSession({ mode: 'Strict Mock', title: `IELTS ${section} Full Mock`, tests, totalMinutes: minutes });
}

function openIeltsMixedPracticeBuilder() {
  const checkboxes = state.tests.filter(t => t.exam === 'IELTS').map(t => `
    <label class="option-row"><input type="checkbox" class="mixed-ielts-cb" value="${t.id}" checked /> ${escapeHtml(t.section)} — ${escapeHtml(t.part)}</label>
  `).join('');
  document.getElementById('ieltsWorkspaceContent').innerHTML = `
    <div class="card"><h2>Mixed Practice</h2>${checkboxes}<button class="btn btn-primary" style="margin-top:14px;" onclick="startSelectedIeltsMixed()">Boshlash</button></div>
  `;
}

function startSelectedIeltsMixed() {
  const ids = Array.from(document.querySelectorAll('.mixed-ielts-cb:checked')).map(el => el.value);
  const tests = state.tests.filter(t => ids.includes(t.id));
  if (tests.length === 0) return;
  launchIeltsSession({ mode: 'Practice', title: 'IELTS Mixed', tests, totalMinutes: 40 });
}

function launchIeltsSession({ mode, title, tests, totalMinutes }) {
  clearActiveTimer();
  enterExamMode();
  const root = document.getElementById('ieltsWorkspaceContent');
  let activeIdx = 0;
  const userAnswers = {};
  const userEssays = {};
  const aiEvaluations = {};

  window._speakingAudioUrls = window._speakingAudioUrls || {};
  let activeRecognition = null;
  let activeMediaRecorder = null;
  let audioChunks = [];

  state.timerSecondsLeft = totalMinutes * 60;
  state.timerElapsed = 0;

  function renderSub(preserveScroll = false) {
    const prevPassageScroll = preserveScroll ? (root.querySelector('.passage-box')?.scrollTop || 0) : 0;
    const prevQuestionsScroll = preserveScroll ? (root.querySelector('.questions-box')?.scrollTop || 0) : 0;

    const t = tests[activeIdx];
    const currentLabel = `${t.section} — ${t.part}`;

    const switchList = tests.length > 1
      ? tests.map((item, idx) => ({
          label: `${item.section} — ${item.part}`,
          sub: item.title && item.title !== `${item.section} — ${item.part}` ? item.title : '',
          isActive: idx === activeIdx,
          action: `window._switchIeltsIdx(${idx})`
        }))
      : state.tests
          .filter(x => x.exam === t.exam && x.section === t.section)
          .map(item => ({
            label: `${item.section} — ${item.part}`,
            sub: item.title && item.title !== `${item.section} — ${item.part}` ? item.title : '',
            isActive: item.id === t.id,
            action: `window._switchIeltsTestById('${item.id}')`
          }));

    const dropdownHtml = switchList.map(item => `
      <button type="button" class="part-dropdown-item ${item.isActive ? 'active' : ''}" onclick="${item.action}">
        <span>${escapeHtml(item.label)} ${item.isActive ? '✓' : ''}</span>
        ${item.sub ? `<small style="color: var(--text-muted); font-size: 0.78rem;">${escapeHtml(item.sub)}</small>` : ''}
      </button>
    `).join('');

    let body = '';
    if (t.section === 'Reading' || t.section === 'Listening') {
      const qHtml = (t.questions || []).map((q, idx) => {
        const fullKey = `${t.id}_${q.id || idx + 1}`;
        const hasOptions = Array.isArray(q.options) && q.options.length > 0;
        const promptText = q.prompt || q.question || '';

        if (hasOptions) {
          const maxSelect = getQuestionMaxSelect(q);
          const currentSel = Array.isArray(userAnswers[fullKey])
            ? userAnswers[fullKey]
            : (userAnswers[fullKey] ? [userAnswers[fullKey]] : []);

          const hintBadge = maxSelect > 1
            ? `<div style="font-size: 0.78rem; font-weight: 700; color: var(--accent-primary); margin-top: 4px;" id="qcount_${escapeHtml(fullKey)}">${maxSelect} ta variant tanlang (${currentSel.length}/${maxSelect})</div>`
            : '';

          const opts = q.options.map(opt => {
            const code = extractOptCode(opt);
            const isSelected = currentSel.includes(code);
            return `<div class="option-row ${isSelected ? 'selected' : ''}" data-qkey="${escapeHtml(fullKey)}" data-optcode="${escapeHtml(code)}" onclick="window._ieltsOpt('${escapeHtml(fullKey)}', '${escapeHtml(code)}', ${maxSelect})"><span>${escapeHtml(opt)}</span></div>`;
          }).join('');

          return `<div class="question-item"><strong>${escapeHtml(promptText)}</strong>${hintBadge}${opts}</div>`;
        }

        const savedVal = escapeHtml(userAnswers[fullKey] || '');
        if (/_{2,}/.test(promptText)) {
          const inlinePrompt = escapeHtml(promptText).replace(
            /_{2,}/,
            `<input type="text" class="input gap-fill-input" data-key="${fullKey}" value="${savedVal}" placeholder="Javob..." style="display:inline-block; width:170px; padding:4px 10px; margin:0 4px;" />`
          );
          return `<div class="question-item" style="line-height: 2;"><strong>${inlinePrompt}</strong></div>`;
        }

        return `
          <div class="question-item">
            <strong>${escapeHtml(promptText)}</strong>
            <div>
              <input type="text" class="input gap-fill-input" data-key="${fullKey}" value="${savedVal}" placeholder="Javobni kiriting..." style="margin-top: 8px; max-width: 340px;" />
            </div>
          </div>
        `;
      }).join('');

      const audioPlayerHtml = t.audioUrl
        ? `<audio controls src="${escapeHtml(t.audioUrl)}" style="width:100%; margin-bottom:12px;"></audio>`
        : '';

      body = `
        <div class="split-exam-grid">
          <div class="passage-box">
            ${audioPlayerHtml}
            <p style="white-space: pre-line;">${escapeHtml(t.passage || t.transcript || '')}</p>
          </div>
          <div class="questions-box">${qHtml}</div>
        </div>
      `;
    } else if (t.section === 'Speaking') {
      const questionsListHtml = (t.questions && t.questions.length > 0)
        ? `<ul style="margin: 10px 0 14px 20px; color: var(--text-primary); line-height: 1.7;">
            ${t.questions.map(q => `<li><strong>${escapeHtml(q.prompt || q.question || '')}</strong></li>`).join('')}
           </ul>`
        : '';

      const audioPlaybackHtml = window._speakingAudioUrls[t.id]
        ? `<div style="margin-top: 12px;">
             <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Yozib olingan ovozingiz:</div>
             <audio controls src="${window._speakingAudioUrls[t.id]}" style="width: 100%; max-width: 420px;"></audio>
           </div>`
        : '';

      body = `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom: 10px;">
            <div>
              <span class="exam-tag tag-ielts">IELTS Speaking • ${escapeHtml(t.part)}</span>
              <h3 style="font-size: 1.25rem; font-weight: 800; margin-top: 4px;">${escapeHtml(t.title)}</h3>
            </div>
            <button type="button" class="btn btn-outline btn-sm" onclick="window._speakExaminerPrompt('${t.id}')">
              🔊 Savolni tinglash (Examiner)
            </button>
          </div>

          <div style="background: var(--bg-subtle); padding: 14px 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid var(--accent-primary);">
            <p style="white-space: pre-line; font-weight: 500;">${escapeHtml(t.prompt || '')}</p>
            ${questionsListHtml}
          </div>

          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px;">
            <button type="button" id="startRecBtn" class="btn btn-primary" onclick="window._startSpeakingRecord('${t.id}')">
              🎙️ Ovozli javobni boshlash
            </button>
            <button type="button" id="stopRecBtn" class="btn btn-danger hidden" onclick="window._stopSpeakingRecord(false)">
              ⏹️ To‘xtatish
            </button>
            <span id="recStatusBadge" style="font-size: 0.88rem; font-weight: 700; color: var(--text-muted);">
              Mikrofon tayyor
            </span>
          </div>

          ${audioPlaybackHtml}

          <div class="form-group" style="margin-top: 14px;">
            <label class="form-label">Nutqingiz matni (Speech-to-Text avtomatik yozadi):</label>
            <textarea class="textarea" id="speakingTranscriptArea" rows="6" placeholder="Mikrofon tugmasini bosib ingliz tilida gapiring...">${escapeHtml(userEssays[t.id] || '')}</textarea>
          </div>

          <button type="button" class="btn btn-sat" id="evalSpeakingBtn" onclick="window._evalSpeaking('${t.id}')">
            🤖 AI Examiner orqali baholash
          </button>

          <div id="aiOut">${aiEvaluations[t.id] ? renderAiSpeakingEvalHtml(aiEvaluations[t.id]) : ''}</div>
        </div>
      `;
    } else {
      const imgHtml = t.imageUrl
        ? `<img src="${escapeHtml(t.imageUrl)}" alt="Task visual" style="max-width:100%; max-height:320px; border-radius:8px; margin-bottom:12px;" />`
        : '';
      body = `
        <div class="card">
          <h3>${escapeHtml(t.title)}</h3>
          ${imgHtml}
          <p style="white-space: pre-line; margin-bottom: 12px;">${escapeHtml(t.prompt || '')}</p>
          <textarea class="textarea" id="essayArea" rows="10" placeholder="Javobingizni yozing...">${escapeHtml(userEssays[t.id] || '')}</textarea>
          <button class="btn btn-primary" style="margin-top:10px;" onclick="window._evalWriting('${t.id}')">AI orqali baholash</button>
          <div id="aiOut">${aiEvaluations[t.id] ? renderAiEvalHtml(aiEvaluations[t.id]) : ''}</div>
        </div>
      `;
    }

    root.innerHTML = `
      <div class="timer-banner">
        <div style="display:flex; align-items:center; gap:10px; position:relative; flex-wrap:wrap;">
          <button type="button" class="btn btn-outline btn-sm" onclick="navigateTo('hub')">← Bosh sahifa</button>
          <span class="${mode === 'Strict Mock' ? 'strict-badge' : 'practice-badge'}">${mode}</span>
          <button type="button" id="ieltsPartPickerBtn" class="part-picker-btn" onclick="window._toggleIeltsDropdown(event)">
            <span>${escapeHtml(currentLabel)}</span>
            <span style="font-size: 0.8rem;">▾</span>
          </button>

          <div id="ieltsPartDropdown" class="part-dropdown-menu hidden">
            ${dropdownHtml}
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:12px;">
          <div class="timer-clock" id="sessionClock">${formatClock(state.timerSecondsLeft)}</div>
          <button class="btn btn-primary btn-sm" onclick="window._finishIelts()">Yakunlash</button>
        </div>
      </div>
      ${body}
    `;

    const area = document.getElementById('essayArea');
    if (area) area.addEventListener('input', e => userEssays[t.id] = e.target.value);

    const spArea = document.getElementById('speakingTranscriptArea');
    if (spArea) spArea.addEventListener('input', e => userEssays[t.id] = e.target.value);

    document.querySelectorAll('.gap-fill-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        userAnswers[e.target.dataset.key] = e.target.value;
      });
    });

    if (preserveScroll) {
      const newPassageBox = root.querySelector('.passage-box');
      const newQuestionsBox = root.querySelector('.questions-box');
      if (newPassageBox) newPassageBox.scrollTop = prevPassageScroll;
      if (newQuestionsBox) newQuestionsBox.scrollTop = prevQuestionsScroll;
    }
  }

  window._toggleIeltsDropdown = (e) => {
    e.stopPropagation();
    const dd = document.getElementById('ieltsPartDropdown');
    if (dd) dd.classList.toggle('hidden');
  };

  window._switchIeltsIdx = (idx) => {
    window._stopSpeakingRecord(true);
    activeIdx = idx;
    renderSub(false);
  };

  window._switchIeltsTestById = (testId) => {
    window._stopSpeakingRecord(true);
    const found = state.tests.find(x => x.id === testId);
    if (!found) return;
    tests = [found];
    activeIdx = 0;
    state.timerSecondsLeft = (found.durationMinutes || 20) * 60;
    renderSub(false);
  };

  // Sahifani qayta chizmasdan, 1 yoki 2+ variantni tanlash
  window._ieltsOpt = (k, v, maxSelect = 1) => {
    if (maxSelect > 1) {
      let arr = Array.isArray(userAnswers[k]) ? [...userAnswers[k]] : (userAnswers[k] ? [userAnswers[k]] : []);
      if (arr.includes(v)) {
        arr = arr.filter(item => item !== v);
      } else {
        if (arr.length >= maxSelect) arr.shift();
        arr.push(v);
      }
      userAnswers[k] = arr;

      document.querySelectorAll(`.option-row[data-qkey="${CSS.escape(k)}"]`).forEach((el) => {
        el.classList.toggle('selected', arr.includes(el.dataset.optcode));
      });

      const badge = document.getElementById(`qcount_${k}`);
      if (badge) badge.textContent = `${maxSelect} ta variant tanlang (${arr.length}/${maxSelect})`;
    } else {
      userAnswers[k] = v;
      document.querySelectorAll(`.option-row[data-qkey="${CSS.escape(k)}"]`).forEach((el) => {
        el.classList.toggle('selected', el.dataset.optcode === v);
      });
    }
  };

  window._speakExaminerPrompt = (tid) => {
    const t = tests.find(x => x.id === tid);
    if (!t || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const qTexts = (t.questions || []).map(q => q.prompt || q.question || '').join('. ');
    const utter = new SpeechSynthesisUtterance(`${t.prompt || ''}. ${qTexts}`);
    utter.lang = 'en-US';
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };

  window._startSpeakingRecord = async (tid) => {
    const startBtn = document.getElementById('startRecBtn');
    const stopBtn = document.getElementById('stopRecBtn');
    const statusBadge = document.getElementById('recStatusBadge');
    const transcriptArea = document.getElementById('speakingTranscriptArea');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      activeMediaRecorder = new MediaRecorder(stream);

      activeMediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      activeMediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        window._speakingAudioUrls[tid] = URL.createObjectURL(blob);
        stream.getTracks().forEach(track => track.stop());
        if (!window._skipSpeakingRerender) renderSub(true);
      };

      window._skipSpeakingRerender = false;
      activeMediaRecorder.start();
    } catch (err) {
      alert('Mikrofonga ruxsat berilmadi yoki mikrofon topilmadi: ' + err.message);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      activeRecognition = new SpeechRecognition();
      activeRecognition.lang = 'en-US';
      activeRecognition.continuous = true;
      activeRecognition.interimResults = true;

      let finalTranscript = userEssays[tid] ? userEssays[tid] + ' ' : '';

      activeRecognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += piece + ' ';
          } else {
            interim += piece;
          }
        }
        userEssays[tid] = (finalTranscript + interim).trim();
        if (transcriptArea) transcriptArea.value = userEssays[tid];
      };

      activeRecognition.onerror = () => {};
      activeRecognition.start();
    }

    if (startBtn) startBtn.classList.add('hidden');
    if (stopBtn) stopBtn.classList.remove('hidden');
    if (statusBadge) {
      statusBadge.textContent = '🔴 Yozilmoqda... Ingliz tilida gapiring';
      statusBadge.style.color = 'var(--danger)';
    }
  };

  window._stopSpeakingRecord = (silent = false) => {
    window._skipSpeakingRerender = silent;
    if (activeRecognition) {
      try { activeRecognition.stop(); } catch (e) {}
      activeRecognition = null;
    }
    if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
      try { activeMediaRecorder.stop(); } catch (e) {}
    }
  };

  window._evalSpeaking = async (tid) => {
    window._stopSpeakingRecord(true);
    const t = tests.find(x => x.id === tid);
    const transcript = (userEssays[tid] || '').trim();
    if (!transcript) {
      alert('Avval ovozli javob bering yoki matn kiriting.');
      return;
    }

    const btn = document.getElementById('evalSpeakingBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ AI Examiner tekshirmoqda...';
    }

    const qTexts = (t.questions || []).map(q => q.prompt || q.question || '').join(' | ');
    const fullPrompt = `${t.prompt || ''} ${qTexts ? 'Questions: ' + qTexts : ''}`.trim();

    try {
      const res = await apiFetch('/api/ai/evaluate-speaking', {
        method: 'POST',
        body: JSON.stringify({
          part: t.part,
          prompt: fullPrompt,
          transcript
        })
      });
      aiEvaluations[tid] = res.evaluation;
      renderSub(true);
    } catch (e) {
      alert(e.message);
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🤖 AI Examiner orqali baholash';
      }
    }
  };

  window._evalWriting = async (tid) => {
    const t = tests.find(x => x.id === tid);
    const text = userEssays[tid] || '';
    try {
      const res = await apiFetch('/api/ai/evaluate-writing', {
        method: 'POST',
        body: JSON.stringify({ taskType: t.part, prompt: t.prompt, responseText: text })
      });
      aiEvaluations[tid] = res.evaluation;
      renderSub(true);
    } catch (e) {
      alert(e.message);
    }
  };

  window._finishIelts = async () => {
    clearActiveTimer();
    exitExamMode();

    let totalQ = 0;
    let correctQ = 0;
    const details = [];

    tests.forEach(item => {
      if (item.section === 'Speaking' || item.section === 'Writing') return;
      (item.questions || []).forEach((q, idx) => {
        const fullKey = `${item.id}_${q.id || idx + 1}`;
        const rawUserVal = userAnswers[fullKey];
        const rawCorrect = Array.isArray(q.answer) ? q.answer.join(', ') : String(q.answer || '').trim();

        if (!rawCorrect) return;
        totalQ++;

        const userArr = Array.isArray(rawUserVal)
          ? rawUserVal.map(x => String(x).trim().toLowerCase()).filter(Boolean)
          : (rawUserVal ? [String(rawUserVal).trim().toLowerCase()] : []);

        const correctParts = rawCorrect
          .split(/\s*[,/&]\s*|\s+and\s+/i)
          .map(x => extractOptCode(x).toLowerCase())
          .filter(Boolean);

        let isCorrect = false;
        if (userArr.length > 0) {
          if (correctParts.length > 1) {
            isCorrect = userArr.length === correctParts.length && correctParts.every(cp => userArr.includes(cp));
          } else {
            const normCorrect = rawCorrect.toLowerCase();
            const singleCode = correctParts[0] || normCorrect;
            isCorrect = userArr.includes(singleCode) || userArr.includes(normCorrect);
          }
        }

        if (isCorrect) correctQ++;

        details.push({
          prompt: q.prompt || q.question || `Savol ${idx + 1}`,
          userAnswer: Array.isArray(rawUserVal) ? rawUserVal.join(', ') : String(rawUserVal || '').trim(),
          correctAnswer: rawCorrect,
          explanation: q.explanation || '',
          isCorrect
        });
      });
    });

    const wrongQ = totalQ - correctQ;
    const lastEval = aiEvaluations[tests[activeIdx]?.id];
    const scoreText = totalQ > 0
      ? `${correctQ} / ${totalQ} (${wrongQ} xato)`
      : (lastEval?.overallBand ? `Band ${lastEval.overallBand}` : 'Yakunlandi');

    const uniqueSections = [...new Set(tests.map(x => x.section))];
    const savedSection = uniqueSections.length > 1 ? 'Full Mock' : tests[0].section;
    const savedPart = uniqueSections.length > 1 ? uniqueSections.join(' + ') : tests[0].part;

    try {
      await apiFetch('/api/history', {
        method: 'POST',
        body: JSON.stringify({
          exam: 'IELTS',
          section: savedSection,
          part: savedPart,
          mode,
          title: uniqueSections.length > 1 ? title : (tests[0].title || title),
          scoreDisplay: scoreText,
          feedback: lastEval?.summaryUz || '',
          durationSeconds: state.timerElapsed
        })
      });
      await refreshAllData();
    } catch (e) {}

    renderIeltsOverview();

    if (totalQ > 0) {
      showTestResultModal({
        title: uniqueSections.length > 1 ? title : (tests[0].title || title),
        total: totalQ,
        correct: correctQ,
        wrong: wrongQ,
        details
      });
    }
  };

  renderSub(false);
  state.activeTimer = setInterval(() => {
    state.timerSecondsLeft--;
    state.timerElapsed++;
    const cl = document.getElementById('sessionClock');
    if (cl) cl.textContent = formatClock(state.timerSecondsLeft);
    if (state.timerSecondsLeft <= 0) window._finishIelts();
  }, 1000);
}

function renderAiEvalHtml(ev) {
  return `
    <div class="ai-report">
      <div style="font-weight: 800; color: var(--accent-primary); margin-bottom: 6px;">AI Bahosi: Band ${escapeHtml(ev.overallBand)}</div>
      <p style="white-space: pre-line;">${escapeHtml(ev.summaryUz)}</p>
    </div>
  `;
}

function renderAiSpeakingEvalHtml(ev) {
  const sampleText = ev.band8Sample || ev.improvedSample || '';
  return `
    <div class="ai-report">
      <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-primary); margin-bottom: 10px;">
        🎙️ IELTS Speaking AI Bahosi: Band ${escapeHtml(ev.overallBand)}
      </div>
      <div class="band-grid">
        <div class="band-box"><div class="val">${escapeHtml(ev.fluencyCoherence ?? ev.fluency ?? ev.overallBand)}</div><div class="lbl">Fluency &amp; Coherence</div></div>
        <div class="band-box"><div class="val">${escapeHtml(ev.lexicalResource ?? ev.lexical ?? ev.overallBand)}</div><div class="lbl">Lexical Resource</div></div>
        <div class="band-box"><div class="val">${escapeHtml(ev.grammaticalRange ?? ev.grammar ?? ev.overallBand)}</div><div class="lbl">Grammar</div></div>
        <div class="band-box"><div class="val">${escapeHtml(ev.pronunciation ?? ev.overallBand)}</div><div class="lbl">Pronunciation</div></div>
      </div>
      <p style="white-space: pre-line; margin-top: 10px;">${escapeHtml(ev.summaryUz || '')}</p>
      ${sampleText ? `
        <div style="margin-top: 12px; padding: 12px; background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border-color);">
          <strong style="font-size: 0.85rem; color: var(--success);">✨ Band 8.5+ Namuna javob:</strong>
          <p style="font-size: 0.9rem; margin-top: 4px; font-style: italic;">"${escapeHtml(sampleText)}"</p>
        </div>
      ` : ''}
    </div>
  `;
}

// ==================== SAT BLUEBOOK & DESMOS ====================
function renderSatOverview() {
  const satTests = state.tests.filter(t => t.exam === 'SAT');
  document.getElementById('satWorkspaceContent').innerHTML = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <span class="exam-tag tag-sat">Digital SAT</span>
          <h1 style="font-size: 1.55rem; font-weight: 800;">Barcha SAT Modullari</h1>
        </div>
        <button class="btn btn-sat" onclick="openSatStrictMockHub()">SAT Strict Mock</button>
      </div>
      ${buildTestCardsGridHtml(satTests, 'SAT')}
    </div>
  `;
}

function renderSatHistoryView() {
  document.getElementById('satWorkspaceContent').innerHTML = `<div class="card"><h2>SAT Tarixi</h2>${buildHistoryTableHtml(state.history.filter(h => h.exam === 'SAT'))}</div>`;
}

function openSatStrictMockHub() {
  document.getElementById('satWorkspaceContent').innerHTML = `
    <div class="card">
      <span class="strict-badge">SAT Mock</span>
      <h2>Digital SAT Strict Mock</h2>
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:12px;">
        <button class="btn btn-sat" onclick="startSatStrictSection('Reading & Writing', 64)">R&amp;W Strict Mock (64m)</button>
        <button class="btn btn-sat" onclick="startSatStrictSection('Math', 70)">Math Strict Mock (70m)</button>
      </div>
    </div>
  `;
}

function startSatStrictSection(section, minutes) {
  const mods = state.tests.filter((t) => t.exam === 'SAT' && t.section === section);
  if (mods.length === 0) {
    alert('Modullar topilmadi.');
    return;
  }
  const questions = mods.flatMap(m => m.questions || []);
  launchBluebookEngine({ mode: 'Strict Mock', section, part: 'Full', title: `SAT ${section} Mock`, questions, minutes });
}

function startSatModule(section, part) {
  const matched = state.tests.filter(t => t.exam === 'SAT' && t.section === section && t.part === part);
  if (matched.length === 0) {
    alert('Modul topilmadi.');
    return;
  }
  document.getElementById('satWorkspaceContent').innerHTML = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <span class="exam-tag tag-sat">SAT ${escapeHtml(section)}</span>
          <h2 style="font-size: 1.4rem; font-weight: 800;">${escapeHtml(section)} — ${escapeHtml(part)}</h2>
        </div>
        <button class="btn btn-outline btn-sm" onclick="renderSatOverview()">← Barcha modullar</button>
      </div>
      ${buildTestCardsGridHtml(matched, 'SAT')}
    </div>
  `;
}

function openSatMixedPracticeBuilder() {
  const checkboxes = state.tests.filter(t => t.exam === 'SAT').map(t => `
    <label class="option-row"><input type="checkbox" class="mixed-sat-cb" value="${t.id}" checked /> ${escapeHtml(t.section)} — ${escapeHtml(t.part)}</label>
  `).join('');
  document.getElementById('satWorkspaceContent').innerHTML = `
    <div class="card"><h2>SAT Mixed Practise</h2>${checkboxes}<button class="btn btn-sat" style="margin-top:14px;" onclick="startSelectedSatMixed()">Boshlash</button></div>
  `;
}

function startSelectedSatMixed() {
  const ids = Array.from(document.querySelectorAll('.mixed-sat-cb:checked')).map(el => el.value);
  const mods = state.tests.filter(t => ids.includes(t.id));
  const questions = mods.flatMap(m => m.questions || []);
  if (questions.length === 0) return;
  launchBluebookEngine({ mode: 'Practice', section: 'SAT Mixed', part: 'Custom', title: 'SAT Mixed Practice', questions, minutes: 40 });
}

function launchBluebookEngine({ mode, section, part, title, questions, minutes }) {
  clearActiveTimer();
  enterExamMode();
  const root = document.getElementById('satWorkspaceContent');
  let qIdx = 0;
  const answers = {};

  state.timerSecondsLeft = minutes * 60;
  state.timerElapsed = 0;

  function renderBB() {
    const q = questions[qIdx];
    const hasOptions = Array.isArray(q.options) && q.options.length > 0;
    const promptText = q.prompt || q.question || '';

    const answerAreaHtml = hasOptions
      ? q.options.map(opt => {
          const code = extractOptCode(opt);
          return `<div class="option-row ${answers[qIdx] === code ? 'selected' : ''}" data-bbcode="${escapeHtml(code)}" onclick="window._bbChoose('${escapeHtml(code)}')"><span>${escapeHtml(opt)}</span></div>`;
        }).join('')
      : `<input type="text" class="input" id="bbGridInput" value="${escapeHtml(answers[qIdx] || '')}" placeholder="Javobingizni kiriting..." style="max-width: 280px;" />`;

    const navPills = questions.map((_, i) => `<button class="q-pill ${i === qIdx ? 'current' : ''} ${answers[i] ? 'answered' : ''}" data-pillidx="${i}" onclick="window._bbJump(${i})">${i + 1}</button>`).join('');

    root.innerHTML = `
      <div class="bluebook-shell">
        <div class="bluebook-header">
          <div style="display:flex; align-items:center; gap:14px;">
            <button type="button" class="bb-tool-btn" onclick="navigateTo('hub')">← Bosh sahifa</button>
            <div>
              <div style="font-size: 0.78rem; color: #94a3b8; font-weight: 700;">${escapeHtml(mode)} • ${escapeHtml(section)}</div>
              <div style="font-size: 1.05rem; font-weight: 800;">${escapeHtml(title)}</div>
            </div>
          </div>
          <div style="font-family: var(--font-mono); font-size: 1.35rem; font-weight: 800;" id="bbTimer">${formatClock(state.timerSecondsLeft)}</div>
          <div class="bluebook-tools">
            <button type="button" class="bb-tool-btn" onclick="window._openDesmosCalculator()">🧮 Desmos Kalkulyator</button>
          </div>
        </div>
        <div class="bluebook-body">
          <div class="bb-pane-left"><p>${escapeHtml(q.passage || '')}</p></div>
          <div class="bb-pane-right">
            <div style="font-weight: 700; margin-bottom: 14px;">${escapeHtml(promptText)}</div>
            <div>${answerAreaHtml}</div>
          </div>
        </div>
        <div class="bluebook-footer">
          <div class="q-nav-pills">${navPills}</div>
          <div>
            ${qIdx < questions.length - 1 ? `<button class="btn btn-sat" onclick="window._bbJump(${qIdx + 1})">Keyingi →</button>` : `<button class="btn btn-primary" onclick="window._finishBB()">Yakunlash</button>`}
          </div>
        </div>
      </div>
    `;

    const gridInp = document.getElementById('bbGridInput');
    if (gridInp) {
      gridInp.addEventListener('input', (e) => {
        answers[qIdx] = e.target.value;
      });
    }
  }

  window._bbChoose = (c) => {
    answers[qIdx] = c;
    document.querySelectorAll('.bb-pane-right .option-row').forEach((el) => {
      el.classList.toggle('selected', el.dataset.bbcode === c);
    });
    const pill = document.querySelector(`.q-pill[data-pillidx="${qIdx}"]`);
    if (pill) pill.classList.add('answered');
  };
  window._bbJump = (i) => {
    qIdx = i;
    renderBB();
  };

  window._finishBB = async () => {
    clearActiveTimer();
    exitExamMode();

    let totalQ = 0;
    let correctQ = 0;
    const details = [];

    questions.forEach((q, idx) => {
      const rawUser = String(answers[idx] || '').trim();
      const rawCorrect = String(q.answer || '').trim();
      if (!rawCorrect) return;

      totalQ++;
      const normUser = rawUser.toLowerCase();
      const normCorrect = rawCorrect.toLowerCase();
      const correctCode = extractOptCode(rawCorrect).toLowerCase();

      const isCorrect = Boolean(normUser) && (normUser === normCorrect || normUser === correctCode);
      if (isCorrect) correctQ++;

      details.push({
        prompt: q.prompt || q.question || `Savol ${idx + 1}`,
        userAnswer: rawUser,
        correctAnswer: rawCorrect,
        explanation: q.explanation || '',
        isCorrect
      });
    });

    const wrongQ = totalQ - correctQ;
    const scoreText = totalQ > 0 ? `${correctQ} / ${totalQ} (${wrongQ} xato)` : 'Yakunlandi';

    try {
      await apiFetch('/api/history', {
        method: 'POST',
        body: JSON.stringify({
          exam: 'SAT',
          section,
          part,
          mode,
          title,
          scoreDisplay: scoreText,
          durationSeconds: state.timerElapsed
        })
      });
      await refreshAllData();
    } catch (e) {}

    renderSatOverview();

    if (totalQ > 0) {
      showTestResultModal({
        title,
        total: totalQ,
        correct: correctQ,
        wrong: wrongQ,
        details
      });
    }
  };

  renderBB();
  state.activeTimer = setInterval(() => {
    state.timerSecondsLeft--;
    state.timerElapsed++;
    const cl = document.getElementById('bbTimer');
    if (cl) cl.textContent = formatClock(state.timerSecondsLeft);
    if (state.timerSecondsLeft <= 0) window._finishBB();
  }, 1000);
}

// ==================== DESMOS KALKULYATOR ====================
window._openDesmosCalculator = () => {
  openModal(`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h3 style="font-size: 1.15rem; font-weight: 800;">Desmos Grafik Kalkulyatori</h3>
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Yopish</button>
    </div>
    <div id="desmosContainer" style="width: 100%; height: 420px; border-radius: 8px;"></div>
  `);
  setTimeout(() => {
    const elt = document.getElementById('desmosContainer');
    if (elt && window.Desmos) {
      window.Desmos.GraphingCalculator(elt, { expressions: true, graphpaper: true });
    }
  }, 100);
};

// ==================== PROFILE ====================
function renderProfileView() {
  if (!state.user) return;
  document.getElementById('profNameInput').value = state.user.name || '';
  document.getElementById('profEmailInput').value = state.user.email || '';
  document.getElementById('profIeltsTarget').value = state.user.targetIelts || '8.0';
  document.getElementById('profSatTarget').value = state.user.targetSat || '1520';

  document.getElementById('profileStatsGrid').innerHTML = `
    <div class="band-box"><div class="val">${state.history.length}</div><div class="lbl">Jami Testlar</div></div>
  `;
  document.getElementById('fullHistoryTableWrap').innerHTML = buildHistoryTableHtml(state.history);
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await apiFetch('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: document.getElementById('profNameInput').value,
        targetIelts: document.getElementById('profIeltsTarget').value,
        targetSat: document.getElementById('profSatTarget').value
      })
    });
    state.user = data.user;
    updateShellForUser();
    const msg = document.getElementById('profSavedMsg');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 2500);
  } catch (err) {
    alert(err.message);
  }
});

// ==================== ADMIN STUDIO ====================
function setupAdminDropdowns() {
  const examSel = document.getElementById('adminExamSelect');
  const secSel = document.getElementById('adminSectionSelect');
  const partSel = document.getElementById('adminPartSelect');
  if (!examSel || !secSel || !partSel || examSel.dataset.bound) return;
  examSel.dataset.bound = '1';

  const map = {
    IELTS: {
      Reading: ['Passage 1', 'Passage 2', 'Passage 3'],
      Listening: ['Part 1', 'Part 2', 'Part 3', 'Part 4'],
      Writing: ['Task 1', 'Task 2'],
      Speaking: ['Part 1', 'Part 2', 'Part 3']
    },
    SAT: {
      'Reading & Writing': ['Module 1', 'Module 2'],
      Math: ['Module 1', 'Module 2']
    }
  };

  function syncParts() {
    const ex = examSel.value;
    const sc = secSel.value;
    const parts = (map[ex] && map[ex][sc]) || ['Part 1'];
    partSel.innerHTML = parts.map(p => `<option value="${p}">${p}</option>`).join('');
  }

  function syncSections() {
    const ex = examSel.value;
    const sections = Object.keys(map[ex] || {});
    secSel.innerHTML = sections.map(s => `<option value="${s}">${s}</option>`).join('');
    syncParts();
  }

  examSel.addEventListener('change', syncSections);
  secSel.addEventListener('change', syncParts);
  syncSections();
}

document.getElementById('adminImportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusBox = document.getElementById('adminImportStatus');
  const btn = document.getElementById('adminImportBtn');
  const fd = new FormData();
  fd.append('exam', document.getElementById('adminExamSelect').value);
  fd.append('section', document.getElementById('adminSectionSelect').value);
  fd.append('part', document.getElementById('adminPartSelect').value);
  fd.append('durationMinutes', document.getElementById('adminDurationInput').value);
  fd.append('customTitle', document.getElementById('adminTitleInput').value);
  fd.append('adminComment', document.getElementById('adminCommentInput').value);

  const rawTextEl = document.getElementById('adminRawTextInput');
  if (rawTextEl && rawTextEl.value.trim()) {
    fd.append('rawText', rawTextEl.value.trim());
  }

  const pdf = document.getElementById('adminPdfInput').files[0];
  const img = document.getElementById('adminImageInput').files[0];
  const aud = document.getElementById('adminAudioInput').files[0];
  if (pdf) fd.append('pdfFile', pdf);
  if (img) fd.append('imageFile', img);
  if (aud) fd.append('audioFile', aud);

  btn.disabled = true;
  statusBox.classList.remove('hidden');
  statusBox.textContent = 'AI ishlamoqda...';
  try {
    const res = await apiFetch('/api/admin/import-test', { method: 'POST', body: fd });
    statusBox.textContent = res.message;
    await refreshAllData();
    renderAdminTestsTable();
  } catch (err) {
    statusBox.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

async function renderAdminTestsTable() {
  const wrap = document.getElementById('adminTestsListWrap');
  if (!wrap) return;
  try {
    const data = await apiFetch('/api/admin/tests');
    wrap.innerHTML = `
      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Imtihon</th>
              <th>Bo‘lim</th>
              <th>Sarlavha</th>
              <th>Qo‘shilgan vaqti</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            ${(data.tests || []).map(t => `
              <tr>
                <td><span class="exam-tag ${t.exam === 'SAT' ? 'tag-sat' : 'tag-ielts'}" style="margin:0;">${escapeHtml(t.exam)}</span></td>
                <td>${escapeHtml(t.section)} — ${escapeHtml(t.part)}</td>
                <td><strong>${escapeHtml(t.title)}</strong></td>
                <td style="color: var(--text-secondary); font-size: 0.85rem;">${escapeHtml(formatDate(t.createdAt || t.addedAt || t.date))}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deleteAdminTest('${escapeHtml(t.id)}')">O'chirish</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {}
}

window.deleteAdminTest = async (id) => {
  if (!confirm('O‘chirishni tasdiqlaysizmi?')) return;
  try {
    await apiFetch(`/api/admin/tests/${id}`, { method: 'DELETE' });
    await refreshAllData();
    renderAdminTestsTable();
  } catch (e) {
    alert(e.message);
  }
};

// ==================== BOOTSTRAP ====================
(async function init() {
  applyTheme(state.theme);
  setupAdminDropdowns();
  if (state.token) {
    try {
      const me = await apiFetch('/api/auth/me');
      state.user = me.user;
      updateShellForUser();
      await refreshAllData();
      navigateTo('hub');
      return;
    } catch {
      localStorage.removeItem('peakmock_token');
      state.token = null;
    }
  }
  hideAllViews();
  document.getElementById('authView').classList.remove('hidden');
})();