// ====== CONFIG ======
const storageKey = 'GYM_API_BASE';
const apiBaseInput = document.getElementById('apiBase');
const saveApiBtn = document.getElementById('saveApi');

const state = {
  apiBase: localStorage.getItem(storageKey) || '',
  members: [],
  plans: [],
  payments: [],
  attendance: []
};

if (state.apiBase) apiBaseInput.value = state.apiBase;
saveApiBtn.addEventListener('click', () => {
  state.apiBase = apiBaseInput.value.trim();
  localStorage.setItem(storageKey, state.apiBase);
  alert('API guardada.');
  init();
});

function apiUrl(path, params = {}) {
  const u = new URL(state.apiBase);
  u.searchParams.set('path', path);
  for (const k in params) u.searchParams.set(k, params[k]);
  return u.toString();
}

async function apiGET(path, params) {
  const res = await fetch(apiUrl(path, params), { method: 'GET' });
  return res.json();
}
async function apiPOST(path, body) {
  const res = await fetch(state.apiBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, ...body })
  });
  return res.json();
}

// ====== UI TABS ======
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tabpanel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ====== LOADERS ======
async function loadAll() {
  if (!state.apiBase) return;
  const [m, p, pay, att] = await Promise.all([
    apiGET('members'),
    apiGET('plans'),
    apiGET('payments'),
    apiGET('attendance'),
  ]);
  state.members = m.items || [];
  state.plans = p.items || [];
  state.payments = (pay.items || []).sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  state.attendance = (att.items || []).filter(x => x.date === todayISO());
}

function todayISO() {
  const d = new Date();
  const z = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return z.toISOString().slice(0,10);
}

// ====== RENDER ======
function renderPlansSelects() {
  const memberPlan = document.getElementById('memberPlan');
  const paymentPlan = document.getElementById('paymentPlan');
  const options = ['<option value="">— Sin plan —</option>']
    .concat(state.plans.filter(p=>p.active!=='FALSE' && p.active!==false)
      .map(p => `<option value="${p.id}">${p.name} · ${p.durationDays} días · $${Number(p.price||0).toFixed(0)}</option>`));
  memberPlan.innerHTML = options.join('');
  paymentPlan.innerHTML = options.slice(1).join('');
}

function planNameById(id) {
  return (state.plans.find(p => p.id===id) || {}).name || '—';
}
function memberNameById(id) {
  return (state.members.find(m => m.id===id) || {}).name || '—';
}

function renderMembers() {
  const body = document.getElementById('tblMembers');
  const search = (document.getElementById('memberSearch').value || '').toLowerCase();
  const rows = state.members
    .filter(m => (m.name||'').toLowerCase().includes(search) || (m.dni||'').includes(search))
    .map(m => {
      const end = m.endDate || '';
      const badge = badgeForEndDate(end);
      return `<tr>
        <td>${m.name || ''}</td>
        <td>${m.dni || ''}</td>
        <td>${planNameById(m.planId)}</td>
        <td>${end || '—'}</td>
        <td>${badge}</td>
        <td><button class="secondary" data-edit="${m.id}">Editar</button></td>
      </tr>`;
    });
  body.innerHTML = rows.join('') || `<tr><td colspan="6">Sin datos</td></tr>`;
  body.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => fillMemberForm(btn.dataset.edit));
  });
}

function badgeForEndDate(endDate) {
  if (!endDate) return `<span class="badge warn">Sin fecha</span>`;
  const today = todayISO();
  if (endDate < today) return `<span class="badge bad">Vencido</span>`;
  const diff = (new Date(endDate) - new Date(today)) / (1000*60*60*24);
  if (diff <= 3) return `<span class="badge warn">Por vencer</span>`;
  return `<span class="badge ok">Activo</span>`;
}

function fillMemberForm(id) {
  const frm = document.getElementById('frmMember');
  const m = state.members.find(x => x.id===id);
  if (!m) return;
  frm.id.value = m.id || '';
  frm.name.value = m.name || '';
  frm.dni.value = m.dni || '';
  frm.phone.value = m.phone || '';
  frm.email.value = m.email || '';
  frm.planId.value = m.planId || '';
  frm.startDate.value = m.startDate || '';
  frm.endDate.value = m.endDate || '';
  frm.active.checked = !(m.active === 'FALSE' || m.active === false);
}

function renderPayments() {
  const body = document.getElementById('tblPayments');
  const rows = state.payments.slice(0, 50).map(p => {
    return `<tr>
      <td>${p.date || ''}</td>
      <td>${memberNameById(p.memberId)}</td>
      <td>${planNameById(p.planId)}</td>
      <td>$${Number(p.amount||0).toFixed(0)}</td>
      <td>${p.method || ''}</td>
    </tr>`;
  });
  body.innerHTML = rows.join('') || `<tr><td colspan="5">Sin pagos</td></tr>`;
}

function renderAttendance() {
  const body = document.getElementById('tblAttendance');
  const rows = state.attendance
    .sort((a,b)=> (b.time||'').localeCompare(a.time||''))
    .map(a => `<tr><td>${a.time || ''}</td><td>${memberNameById(a.memberId)}</td><td>${a.note||''}</td></tr>`);
  body.innerHTML = rows.join('') || `<tr><td colspan="3">Sin asistencias hoy</td></tr>`;
}

function renderDashboard() {
  const activos = state.members.filter(m => {
    const end = m.endDate;
    return end && end >= todayISO();
  }).length;

  let vencidos = 0, porVencer = 0;
  const alertRows = [];
  state.members.forEach(m => {
    const end = m.endDate;
    const badge = badgeForEndDate(end);
    if (!end) return;
    if (end < todayISO()) vencidos++;
    else {
      const diff = (new Date(end) - new Date(todayISO())) / (1000*60*60*24);
      if (diff <= 3) porVencer++;
    }
    if (end < todayISO() || ((new Date(end)-new Date(todayISO()))/(1000*60*60*24))<=3) {
      alertRows.push(`<tr><td>${m.name}</td><td>${m.dni||''}</td><td>${planNameById(m.planId)}</td><td>${end}</td><td>${badge}</td></tr>`);
    }
  });

  const pagosMes = state.payments.filter(p => {
    const d = (p.date||'').slice(0,7);
    const now = todayISO().slice(0,7);
    return d === now;
  }).length;

  document.getElementById('kpiActivos').textContent = activos;
  document.getElementById('kpiVencidos').textContent = `${vencidos} / ${porVencer}`;
  document.getElementById('kpiPagosMes').textContent = pagosMes;
  document.getElementById('tblAlertas').innerHTML = alertRows.join('') || `<tr><td colspan="5">Sin alertas</td></tr>`;
}

function fillSelectsMembers() {
  const opts = state.members.map(m => `<option value="${m.id}">${m.name}</option>`);
  document.getElementById('paymentMember').innerHTML = opts.join('');
  document.getElementById('attendanceMember').innerHTML = opts.join('');
}

// ====== FORMS ======
document.getElementById('frmMember').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const body = {
    id: f.id.value || undefined,
    name: f.name.value.trim(),
    dni: f.dni.value.trim(),
    phone: f.phone.value.trim(),
    email: f.email.value.trim(),
    planId: f.planId.value || '',
    startDate: f.startDate.value || '',
    endDate: f.endDate.value || '',
    active: f.active.checked
  };
  await apiPOST('members', body);
  await init(); // recarga datos y UI
  f.reset();
});

document.getElementById('frmPlan').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const body = {
    id: f.id.value || undefined,
    name: f.name.value.trim(),
    durationDays: Number(f.durationDays.value),
    price: Number(f.price.value),
    active: f.active.checked
  };
  await apiPOST('plans', body);
  await init();
  f.reset();
});

document.getElementById('frmPayment').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const body = {
    memberId: f.memberId.value,
    planId: f.planId.value || '',
    amount: Number(f.amount.value),
    date: f.date.value,
    method: f.method.value,
    note: f.note.value.trim()
  };
  await apiPOST('payments', body);
  await init();
  f.reset();
});

document.getElementById('frmAttendance').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const body = {
    memberId: f.memberId.value,
    note: f.note.value.trim()
  };
  await apiPOST('attendance', body);
  await init();
  f.reset();
});

// Búsqueda de socios
document.getElementById('memberSearch').addEventListener('input', renderMembers);

// ====== INIT ======
async function init() {
  if (!state.apiBase) return;
  await loadAll();
  renderPlansSelects();
  renderMembers();
  renderPayments();
  renderAttendance();
  renderDashboard();
  fillSelectsMembers();
}
init();
