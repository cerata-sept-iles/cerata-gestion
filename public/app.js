// ============================================================
// CERATA GESTION — Main App JS
// ============================================================
let user = null, companies = [], currentCo = null, currentScreen = 'dashboard';
let soumView = 'list';

// ===== INIT =====
async function init() {
  try {
    const r = await api('/auth/me');
    user = r;
  } catch (e) { window.location = '/'; return; }
  companies = await api('/companies');
  currentCo = localStorage.getItem('co') || companies[0]?.id;
  renderLayout();
  navigate('dashboard');
}

// ===== LAYOUT =====
function renderLayout() {
  document.getElementById('app').innerHTML = `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sb-logo">
          <h2>Cerata <span>•</span></h2>
          <p>Gestion Chantier</p>
        </div>
        <div class="sb-co">
          <select id="coSelect" onchange="changeCo(this.value)">
            ${companies.map(c => `<option value="${c.id}" ${c.id===currentCo?'selected':''}>${c.nom}</option>`).join('')}
          </select>
        </div>
        <nav class="sb-nav">
          <div class="nav-section">
            <div class="nav-section-title">Principal</div>
            ${navItem('dashboard','Tableau de bord','M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z')}
            ${navItem('dossiers','Dossiers','M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z')}
            ${navItem('soumissions','Soumissions','M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z','soumBadge')}
            ${navItem('bons','Bons de travail','M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z')}
            ${navItem('rapports','Rapports de service','M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15C3.1 3 2 4.1 2 5.3v13.5C2 20 3.1 21 4.5 21h15c1.4 0 2.5-1 2.5-2.2V5.3C22 4.1 20.9 3 19.5 3z')}
            ${navItem('factures','Facturation','M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z')}
          </div>
          <div class="nav-section">
            <div class="nav-section-title">Ressources</div>
            ${navItem('contacts','Contacts','M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z')}
            ${navItem('temps','Feuilles de temps','M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z')}
            ${user?.role==='admin' ? navItem('users','Utilisateurs','M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z') : ''}
          </div>
        </nav>
        <div class="sb-user">
          <div class="sb-user-name">${user.nom}</div>
          <div class="sb-user-email">${user.email}</div>
          <button class="sb-logout" onclick="logout()">Déconnexion</button>
        </div>
      </aside>
      <div class="main-area">
        <div class="topbar">
          <div class="topbar-title" id="topbarTitle">Tableau de bord</div>
          <div class="topbar-actions">
            <button class="btn-new" onclick="openNew()" id="btnNew" style="display:none">
              <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              <span id="btnNewLabel">Nouveau</span>
            </button>
          </div>
        </div>
        <div class="content" id="mainContent"></div>
      </div>
    </div>

    <!-- Drawer Modal -->
    <div class="modal-overlay" id="drawerOverlay" onclick="closeDrawer(event)">
      <div class="modal-drawer" id="drawer" onclick="event.stopPropagation()">
        <div class="drawer-header">
          <div class="drawer-title" id="drawerTitle">Nouveau</div>
          <button class="drawer-close" onclick="closeDrawer()">✕</button>
        </div>
        <div class="drawer-body" id="drawerBody"></div>
        <div class="drawer-footer" id="drawerFooter"></div>
      </div>
    </div>

    <!-- Detail Panel -->
    <div class="detail-overlay" id="detailOverlay" onclick="closeDetail()"></div>
    <div class="detail-panel" id="detailPanel" style="display:none"></div>
  `;
}

function navItem(id, label, path, badgeId='') {
  return `<button class="nav-item" id="nav-${id}" onclick="navigate('${id}')">
    <svg viewBox="0 0 24 24"><path d="${path}"/></svg>
    <span>${label}</span>
    ${badgeId ? `<span class="badge-dot" id="${badgeId}" style="display:none">0</span>` : ''}
  </button>`;
}

// ===== NAVIGATION =====
const SCREEN_CONFIG = {
  dashboard: { title: 'Tableau de bord', showNew: false },
  dossiers: { title: 'Dossiers', showNew: true, newLabel: '+ Nouveau dossier' },
  soumissions: { title: 'Soumissions', showNew: true, newLabel: '+ Nouvelle soumission' },
  bons: { title: 'Bons de travail', showNew: true, newLabel: '+ Nouveau bon' },
  rapports: { title: 'Rapports de service', showNew: true, newLabel: '+ Nouveau rapport' },
  factures: { title: 'Facturation', showNew: true, newLabel: '+ Nouvelle facture' },
  contacts: { title: 'Contacts', showNew: true, newLabel: '+ Nouveau contact' },
  temps: { title: 'Feuilles de temps', showNew: true, newLabel: '+ Ajouter des heures' },
  users: { title: 'Utilisateurs', showNew: true, newLabel: '+ Nouvel utilisateur' },
};

function navigate(screen) {
  currentScreen = screen;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('nav-'+screen);
  if (navEl) navEl.classList.add('active');
  const cfg = SCREEN_CONFIG[screen] || {};
  document.getElementById('topbarTitle').textContent = cfg.title || screen;
  const btn = document.getElementById('btnNew');
  if (btn) { btn.style.display = cfg.showNew ? 'flex' : 'none'; document.getElementById('btnNewLabel').textContent = cfg.newLabel || 'Nouveau'; }
  const renders = { dashboard: renderDashboard, dossiers: renderDossiers, soumissions: renderSoumissions, bons: renderBons, rapports: renderRapports, factures: renderFactures, contacts: renderContacts, temps: renderTemps, users: renderUsers };
  if (renders[screen]) renders[screen]();
}

function openNew() {
  const forms = { dossiers: openDossierForm, soumissions: openSoumForm, bons: openBonForm, rapports: openRapForm, factures: openFacForm, contacts: openContForm, temps: openTempsForm, users: openUserForm };
  if (forms[currentScreen]) forms[currentScreen]();
}

function changeCo(id) { currentCo = id; localStorage.setItem('co', id); navigate(currentScreen); }

// ===== API =====
async function api(path, opts={}) {
  const r = await fetch('/api' + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (r.status === 401) { window.location = '/'; throw new Error('Unauthorized'); }
  if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Erreur'); }
  return r.json();
}

// ===== AUTO-FILL CLIENT FROM DOSSIER =====
let _formDoss = [];
function fillClientFromDoss(dossId, fieldId) {
  if (!dossId) return;
  const d = _formDoss.find(x => String(x.id) === String(dossId));
  if (d && d.client) { const el = document.getElementById(fieldId); if (el) el.value = d.client; }
}
async function fillPoFromDoss(dossId, fieldId) {
  if (!dossId) return;
  try { const r = await api('/dossiers/' + dossId + '/po'); if (r && r.numero_po) { const el = document.getElementById(fieldId); if (el) el.value = r.numero_po; } } catch(e) {}
}
function fillDossClientAndPo(dossId) { fillClientFromDoss(dossId, 'rClient'); fillPoFromDoss(dossId, 'rNumPO'); }
function toggleSoumPo() { const t = document.getElementById('sType'); const row = document.getElementById('sPORow'); if (row) row.style.display = (t && t.value === 'Commercial') ? 'block' : 'none'; }

// ===== DRAWER =====
function openDrawer(title, bodyHTML, footerHTML) {
  document.getElementById('drawerTitle').textContent = title;
  document.getElementById('drawerBody').innerHTML = bodyHTML;
  document.getElementById('drawerFooter').innerHTML = footerHTML;
  document.getElementById('drawerOverlay').classList.add('open');
}
function closeDrawer(e) {
  if (e && e.target !== document.getElementById('drawerOverlay')) return;
  document.getElementById('drawerOverlay').classList.remove('open');
}
function fv(id) { return document.getElementById(id)?.value || ''; }
function fs(id, v) { const e = document.getElementById(id); if(e) e.value = v || ''; }

// ===== TOAST =====
function toast(msg, type='ok') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast show';
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== HELPERS =====
function fmt(n) { return n ? '$' + Number(n).toLocaleString('fr-CA', {minimumFractionDigits:2, maximumFractionDigits:3}) : '—'; }
function fd(d) { if(!d) return '—'; const p=d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; }
function today() { return new Date().toISOString().slice(0,10); }
function badge(s) {
  const m = {'En cours':'b-blue','Planifié':'b-navy','En attente':'b-orange','Terminé':'b-green','Terminée':'b-green','Annulé':'b-gray','Acceptée':'b-green','Refusée':'b-red','Révision':'b-purple','Ouvert':'b-blue','Facturé':'b-purple','Brouillon':'b-gray','Complété':'b-blue','Approuvé':'b-green','Urgente':'b-red','Haute':'b-orange','Normale':'b-gray','Envoyée':'b-orange','Payée':'b-green','En retard':'b-red'};
  return `<span class="badge ${m[s]||'b-gray'}">${s}</span>`;
}
function cardColor(s) {
  const m = {'En cours':'cl-blue','Planifié':'cl-blue','En attente':'cl-orange','Terminé':'cl-green','Annulé':'cl-gray','Acceptée':'cl-green','Refusée':'cl-red','Révision':'cl-purple','Ouvert':'cl-blue','Facturé':'cl-purple','Brouillon':'cl-gray','Complété':'cl-blue','Approuvé':'cl-green','Envoyée':'cl-orange','Payée':'cl-green','En retard':'cl-red'};
  return m[s]||'cl-gray';
}
function soumStatusClass(s) { return {'En attente':'ss-att','Acceptée':'ss-acc','Refusée':'ss-ref','Révision':'ss-rev'}[s]||'ss-att'; }

// ===== DASHBOARD =====
async function renderDashboard() {
  const content = document.getElementById('mainContent');
  content.innerHTML = '<div style="color:var(--gray);padding:40px;text-align:center">Chargement...</div>';
  const d = await api('/dashboard?company_id='+currentCo);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  // Update soumission badge
  const sb = document.getElementById('soumBadge');
  if (sb) { const n = d.soum_attente?.n||0; sb.style.display=n?'flex':'none'; sb.textContent=n; }

  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-size:22px;font-weight:900;color:var(--text)">${greeting}, ${user.nom.split(' ')[0]} 👋</h2>
      <p style="color:var(--text3);font-size:14px">${new Date().toLocaleDateString('fr-CA', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card sc-blue" onclick="navigate('dossiers')" style="cursor:pointer">
        <div class="stat-val">${d.dossiers_actifs}</div>
        <div class="stat-label">Dossiers actifs</div>
      </div>
      <div class="stat-card sc-orange" onclick="navigate('soumissions')" style="cursor:pointer">
        <div class="stat-val">${d.soum_attente?.n||0}</div>
        <div class="stat-label">Soumissions en attente</div>
        <div class="stat-sub">${fmt(d.soum_attente?.total)}</div>
      </div>
      <div class="stat-card sc-green" onclick="navigate('soumissions')" style="cursor:pointer">
        <div class="stat-val">${d.soum_acceptees?.n||0}</div>
        <div class="stat-label">Soumissions acceptées</div>
        <div class="stat-sub">${fmt(d.soum_acceptees?.total)}</div>
      </div>
      <div class="stat-card sc-red" onclick="navigate('factures')" style="cursor:pointer">
        <div class="stat-val">${d.factures_impayees?.n||0}</div>
        <div class="stat-label">Factures impayées</div>
        <div class="stat-sub">${fmt(d.factures_impayees?.total)}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div>
        <div style="font-size:13px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">Soumissions récentes</div>
        <div class="cards-list">
          ${d.soumissions_recentes.length ? d.soumissions_recentes.map(s => `
            <div class="card ${cardColor(s.statut)}" onclick="openSoumDetail('${s.id}')">
              <div class="card-header">
                <div>
                  <div class="card-title">${s.titre}</div>
                  <div class="card-sub">${s.client||'—'}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:16px;font-weight:800">${fmt(s.montant)}</div>
                </div>
              </div>
              <div class="soum-status ${soumStatusClass(s.statut)}">
                <div class="ss-dot"></div>${s.statut}
              </div>
            </div>`).join('') : '<div class="empty-state"><div class="es-icon">📋</div><p>Aucune soumission</p></div>'}
        </div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">Dossiers récents</div>
        <div class="cards-list">
          ${d.dossiers_recents.length ? d.dossiers_recents.map(dos => `
            <div class="card ${cardColor(dos.statut)}" onclick="openDossierDetail(${dos.id})">
              <div class="card-header">
                <div>
                  <div class="card-title">${dos.nom}</div>
                  <div class="card-sub">${dos.client||'—'}</div>
                </div>
                ${badge(dos.statut)}
              </div>
              ${dos.avancement ? `<div class="prog-bar"><div class="prog-fill" style="width:${dos.avancement}%"></div></div>` : ''}
            </div>`).join('') : '<div class="empty-state"><div class="es-icon">🏗️</div><p>Aucun dossier</p></div>'}
        </div>
      </div>
    </div>`;
}

// ===== DOSSIERS =====
let dossFilt = 'Tous';
async function renderDossiers() {
  const content = document.getElementById('mainContent');
  const params = `company_id=${currentCo}${dossFilt!=='Tous'?'&statut='+dossFilt:''}`;
  const doss = await api('/dossiers?'+params);
  const statuts = ['Tous','En cours','Planifié','En attente','Terminé','Annulé'];
  content.innerHTML = `
    <div class="filter-bar">
      ${statuts.map(s=>`<button class="filter-btn ${s===dossFilt?'active':''}" onclick="dossFilt='${s}';renderDossiers()">${s}</button>`).join('')}
      <span style="color:var(--gray);font-size:12px;margin-left:8px">${doss.length} dossier${doss.length!==1?'s':''}</span>
    </div>
    <div class="cards-list">
      ${doss.length ? doss.map(d => `
        <div class="card ${cardColor(d.statut)}" onclick="openDossierDetail(${d.id})">
          <div class="card-header">
            <div style="flex:1">
              <div class="card-title">${d.nom}</div>
              <div class="card-sub">${d.client||'—'}${d.tel?' · '+d.tel:''}</div>
              ${d.adresse_travaux?`<div style="font-size:12px;color:var(--text3);margin-top:2px">📍 ${d.adresse_travaux}</div>`:''}
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
              ${badge(d.statut)}
              ${d.priorite&&d.priorite!=='Normale'?badge(d.priorite):''}
            </div>
          </div>
          ${d.avancement?`<div class="prog-bar" style="margin-top:10px"><div class="prog-fill" style="width:${d.avancement}%"></div></div>`:''}
          <div class="card-meta">
            ${d.type_travaux?`<span class="badge b-navy">${d.type_travaux}</span>`:''}
            ${d.categorie?`<span class="badge b-blue">${d.categorie}</span>`:''}
            ${d.budget?`<span class="badge b-accent">💰 ${fmt(d.budget)}</span>`:''}
            ${d.representant?`<span class="badge b-gray">👤 ${d.representant}</span>`:''}
            ${d.numero?`<span class="badge b-gray">#${d.numero}|/span>`:''}
          </div>
        </div>`).join('') : `<div class="empty-state"><div class="es-icon">🏗️</div><h3>Aucun dossier</h3><p>Cliquez sur "+ Nouveau dossier" pour commencer.</p></div>`}
    </div>`;
}

function dossierFormHTML(d={}) {
  return `
    <div class="fsec">Informations générales</div>
    <div class="fg"><label class="flabel">Nom du dossier *</label><input class="finput" id="fNom" value="${d.nom||''}" placeholder="Ex: Résidentiel - Martin - dalle béton"></div>
    <div class="frow">
      <div class="fg"><label class="flabel">Numéro</label><input class="finput" id="fNum" value="${d.numero||''}"></div>
      <div class="fg"><label class="flabel">Statut</label><select class="fselect" id="fStatut">${['En cours','Planifié','En attente','Terminé','Annulé'].map(s=>`<option ${d.statut===s?'selected':''}>${s}</option>`).join('')}</select></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="flabel">Priorité</label><select class="fselect" id="fPrio">${['Normale','Haute','Urgente','Faible'].map(s=>`<option ${d.priorite===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="fg"><label class="flabel">Avancement (%)</label><input class="finput" id="fAvanc" type="number" min="0" max="100" value="${d.avancement||0}"></div>
    </div>
    <div class="fsep"></div><div class="fsec">Client</div>
    <div class="fg"><label class="flabel">Nom du client *</label><input class="finput" id="fClient" value="${d.client||''}" placeholder="Nom ou entreprise"></div>
    <div class="fg"><label class="flabel">Contact</label><input class="finput" id="fContact" value="${d.contact||''}"></div>
    <div class="frow">
      <div class="fg"><label class="flabel">Téléphone</label><input class="finput" id="fTel" type="tel" value="${d.tel||''}"></div>
      <div class="fg"><label class="flabel">Cellulaire</label><input class="finput" id="fCell" type="tel" value="${d.cell||''}"></div>
    </div>
    <div class="fg"><label class="flabel">Courriel</label><input class="finput" id="fEmail" type="email" value="${d.email||''}"></div>
    <div class="fg"><label class="flabel">Adresse travaux</label><input class="finput" id="fAddr" value="${d.adresse_travaux||''}" placeholder="Adresse, Ville, QC"></div>
    <div class="fsep"></div><div class="fsec">Travaux</div>
    <div class="frow">
      <div class="fg"><label class="flabel">Type de travaux</label><select class="fselect" id="fType">${['','Résidentiel','Commercial','Industriel','Municipal','Institutionnel'].map(s=>`<option ${d.type_travaux===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="fg"><label class="flabel">Catégorie</label><select class="fselect" id="fCat">${['','Pompage béton','Coupage béton','Acrylique','Injection fissure','Dalle béton','Carottage','Sciage','Autre'].map(s=>`<option ${d.categorie===s?'selected':''}>${s}</option>`).join('')}</select></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="flabel">Représentant</label><input class="finput" id="fRep" value="${d.representant||''}"></div>
      <div class="fg"><label class="flabel">Gestionnaire</label><input class="finput" id="fGest" value="${d.gestionnaire||''}"></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="flabel">Date début</label><input class="finput" id="fDebut" type="date" value="${d.date_debut||''}"></div>
      <div class="fg"><label class="flabel">Date fin prévue</label><input class="finput" id="fFin" type="date" value="${d.date_fin||''}"></div>
    </div>
    <div class="fg"><label class="flabel">Budget ($)</label><input class="finput" id="fBudget" type="number" value="${d.budget||''}"></div>
    <div class="fg"><label class="flabel">Description / Notes</label><textarea class="ftextarea" id="fDesc">${d.description||''}</textarea></div>`;
}

function openDossierForm(d={}) {
  openDrawer(d.id ? 'Modifier le dossier' : 'Nouveau dossier', dossierFormHTML(d), `
    <button class="btn-prim" onclick="saveDossier(${d.id||''})">Enregistrer</button>
    ${d.id?`<button class="btn-danger" onclick="delDossier(${d.id})">Supprimer</button>`:''}
    <button class="btn-sec" onclick="closeDrawer({target:document.getElementById('drawerOverlay')})">Annuler</button>`);
}

async function saveDossier(id) {
  const data = { company_id: currentCo, nom: fv('fNom'), numero: fv('fNum'), statut: fv('fStatut'), priorite: fv('fPrio'), avancement: fv('fAvanc'), client: fv('fClient'), contact: fv('fContact'), tel: fv('fTel'), cell: fv('fCell'), email: fv('fEmail'), adresse_travaux: fv('fAddr'), type_travaux: fv('fType'), categorie: fv('fCat'), representant: fv('fRep'), gestionnaire: fv('fGest'), date_debut: fv('fDebut'), date_fin: fv('fFin'), budget: fv('fBudget'), description: fv('fDesc') };
  if (!data.nom || !data.client) { toast('Nom et client requis', 'err'); return; }
  try {
    if (id) await api('/dossiers/'+id, { method:'PUT', body: JSON.stringify(data) });
    else await api('/dossiers', { method:'POST', body: JSON.stringify(data) });
    closeDrawer({ target: document.getElementById('drawerOverlay') });
    toast('Dossier enregistré ✓'); renderDossiers();
  } catch(e) { toast(e.message, 'err'); }
}

async function delDossier(id) {
  if (!confirm('Supprimer ce dossier ?')) return;
  await api('/dossiers/'+id, { method:'DELETE' });
  closeDrawer({ target: document.getElementById('drawerOverlay') }); toast('Supprimé'); renderDossiers();
}

// ===== DOSSIER DETAIL PANEL =====
async function openDossierDetail(id) {
  const panel = document.getElementById('detailPanel');
  const overlay = document.getElementById('detailOverlay');
  panel.style.display = 'flex'; overlay.classList.add('open');
  panel.innerHTML = `<div style="padding:40px;text-align:center;color:var(--gray)">Chargement...</div>`;

  const d = await api('/dossiers/'+id);
  panel.innerHTML = `
    <div class="detail-header">
      <button onclick="closeDetail()" style="background:rgba(255,255,255,.15);border:none;color:white;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:13px">← Retour</button>
      <h2>${d.nom}</h2>
      <div style="display:flex;gap:8px">
        ${badge(d.statut)}
        <button onclick="openDossierForm(${JSON.stringify(d).replace(/"/g,'&quot;')})" style="background:rgba(255,255,255,.15);border:none;color:white;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:13px">✏️ Modifier</button>
      </div>
    </div>
    <div class="detail-tabs" id="detailTabs">
      ${['Client','Soumission','Bon de travail','Rapport de service','Facture','Notes','Checklist'].map((t,i)=>`<button class="detail-tab ${i===0?'active':''}" onclick="switchDetailTab('${t}',${id},this)">${t}</button>`).join('')}
    </div>
    <div class="detail-content" id="detailContent"></div>`;
  loadDetailTab('Client', id, d);
}
function closeDetail() { document.getElementById('detailPanel').style.display='none'; document.getElementById('detailOverlay').classList.remove('open'); }
function switchDetailTab(tab, id, btn) { document.querySelectorAll('.detail-tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); loadDetailTab(tab, id); }

async function loadDetailTab(tab, id, d) {
  const c = document.getElementById('detailContent');
  if (tab === 'Client') {
    if (!d) d = await api('/dossiers/'+id);
    c.innerHTML = `<table class="info-table">
      <tr><td>Nom</td><td>${d.nom||'—'}</td></tr>
      <tr><td>N° dossier</td><td>${d.numero||'—'}</td></tr>
      <tr><td>Statut</td><td>${badge(d.statut)}</td></tr>
      <tr><td>Client</td><td>${d.client||'—'}</td></tr>
      <tr><td>Téléphone</td><td>${d.tel?`<a href="tel:${d.tel}" style="color:var(--blue2)">${d.tel}</a>`:'—'}</td></tr>
      <tr><td>Cellulaire</td><td>${d.cell?`<a href="tel:${d.cell}" style="color:var(--blue2)">${d.cell}</a>`:'—'}</td></tr>
      <tr><td>Courriel</td><td>${d.email?`<a href="mailto:${d.email}" style="color:var(--blue2)">${d.email}</a>`:'—'}</td></tr>
      <tr><td>Adresse travaux</td><td>${d.adresse_travaux||'—'}</td></tr>
      <tr><td>Type de travaux</td><td>${d.type_travaux||'—'}</td></tr>
      <tr><td>Catégorie</td><td>${d.categorie||'—'}</td></tr>
      <tr><td>Représentant</td><td>${d.representant||'—'}</td></tr>
      <tr><td>Date début</td><td>${fd(d.date_debut)}</td></tr>
      <tr><td>Date fin prévue</td><td>${fd(d.date_fin)}</td></tr>
      <tr><td>Budget</td><td>${fmt(d.budget)}</td></tr>
      <tr><td>Avancement</td><td>${d.avancement||0}%</td></tr>
      <tr><td>Description</td><td>${d.description||'—'}</td></tr>
    </table>`;
  } else if (tab === 'Soumission') {
    const items = await api('/soumissions?company_id='+currentCo+'&dossier_id='+id) || [];
    c.innerHTML = `<button class="btn-new" style="margin-bottom:14px" onclick="openSoumForm(${id})">+ Nouvelle soumission</button>
      <div class="cards-list">${items.length ? items.map(s=>`
        <div class="card ${cardColor(s.statut)}" onclick="openSoumDetail('${s.id}')">
          <div class="card-header"><div><div class="card-title">${s.titre}</div><div class="card-sub">${s.client||'—'}</div></div><div style="font-size:16px;font-weight:800">${fmt(s.montant)}</div></div>
          <div class="soum-status ${soumStatusClass(s.statut)}"><div class="ss-dot"></div>${s.statut}</div>
        </div>`).join('') : '<p style="color:var(--gray)">Aucune soumission</p>'}</div>`;
  } else if (tab === 'Bon de travail') {
    const items = await api('/bons?company_id='+currentCo+'&dossier_id='+id) || [];
    c.innerHTML = `<button class="btn-new" style="margin-bottom:14px" onclick="openBonForm(null,${id})">+ Nouveau bon</button>
      <div class="cards-list">${items.map(b=>`<div class="card ${cardColor(b.statut)}" onclick="openBonDetail(${b.id})">
        <div class="card-header"><div><div class="card-title">BT #${b.numero} — ${fd(b.date)}</div><div class="card-sub">${b.client||'—'}</div></div>${badge(b.statut)}</div>
        <div class="card-meta">${b.heures?`<span class="badge b-blue">⏱ ${b.heures}h</span>`:''} ${fmt((b.heures||0)*(b.taux_horaire||0)+(b.cout_materiaux||0))?`<span class="badge b-accent">💰 ${fmt((b.heures||0)*(b.taux_horaire||0)+(b.cout_materiaux||0))}</span>`:''}</div>
      </div>`).join('') || '<p style="color:var(--gray)">Aucun bon de travail</p>'}</div>`;
  } else if (tab === 'Rapport de service') {
    const items = await api('/rapports?company_id='+currentCo+'&dossier_id='+id) || [];
    c.innerHTML = `<button class="btn-new" style="margin-bottom:14px" onclick="openRapForm(null,${id})">+ Nouveau rapport</button>
      <div class="cards-list">${items.map(r=>`<div class="card ${cardColor(r.statut)}">
        <div class="card-header"><div><div class="card-title">RS #${r.numero||'—'} — ${fd(r.date)}</div><div class="card-sub">${r.technicien||'—'}</div></div>${badge(r.statut)}</div>
        <div style="font-size:13px;color:var(--text3);margin-top:6px">${r.travaux?r.travaux.substring(0,100)+'…':''}</div>
      </div>`).join('') || '<p style="color:var(--gray)">Aucun rapport</p>'}</div>`;
  } else if (tab === 'Facture') {
    const items = await api('/factures?company_id='+currentCo) || [];
    const filtered = items.filter(f=>f.dossier_id==id);
    c.innerHTML = `<button class="btn-new" style="margin-bottom:14px" onclick="openFacForm(${id})">+ Nouvelle facture</button>
      <div class="cards-list">${filtered.map(f=>`<div class="card ${cardColor(f.statut)}">
        <div class="card-header"><div><div class="card-title">Facture #${f.numero} — ${fd(f.date)}</div><div class="card-sub">${f.client||'—'}</div></div><div style="font-size:16px;font-weight:800">${fmt(f.total)}</div></div>
        ${badge(f.statut)}
      </div>`).join('') || '<p style="color:var(--gray)">Aucune facture</p>'}</div>`;
  } else if (tab === 'Notes') {
    const notes = await api('/dossiers/'+id+'/notes');
    c.innerHTML = `<div class="fg"><textarea class="ftextarea" id="newNote" placeholder="Ajouter une note..." rows="3"></textarea>
      <button class="btn-prim" style="margin-top:8px" onclick="addNote(${id})">Ajouter</button></div>
      <div style="margin-top:16px">${notes.map(n=>`<div style="background:var(--gray2);border-radius:10px;padding:12px;margin-bottom:10px">
        <div style="font-size:13px">${n.content}</div>
        <div style="font-size:11px;color:var(--gray);margin-top:6px">${n.auteur} — ${new Date(n.created_at).toLocaleDateString('fr-CA')}</div>
      </div>`).join('') || '<p style="color:var(--gray)">Aucune note</p>'}</div>`;
  } else if (tab === 'Checklist') {
    const items = await api('/dossiers/'+id+'/checklist');
    c.innerHTML = `<div class="fg" style="display:flex;gap:8px"><input class="finput" id="newCheck" placeholder="Nouvelle tâche...">
      <button class="btn-prim" onclick="addCheck(${id})">+</button></div>
      <div style="margin-top:12px">${items.map(i=>`<div style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid var(--gray3)">
        <input type="checkbox" ${i.complete?'checked':''} onchange="toggleCheck(${i.id},this.checked)" style="width:16px;height:16px;cursor:pointer">
        <span style="${i.complete?'text-decoration:line-through;color:var(--gray)':''}">${i.item}</span>
      </div>`).join('') || '<p style="color:var(--gray)">Aucune tâche</p>'}</div>`;
  }
}

async function addNote(id) { const txt = fv('newNote'); if(!txt) return; await api('/dossiers/'+id+'/notes', {method:'POST',body:JSON.stringify({contenu:txt})}); loadDetailTab('Notes',id); }
async function addCheck(id) { const txt = fv('newCheck'); if(!txt) return; await api('/dossiers/'+id+'/checklist', {method:'POST',body:JSON.stringify({item:txt})}); loadDetailTab('Checklist',id); }
async function toggleCheck(id, val) { await api('/dossiers/checklist/'+id, {method:'PUT',body:JSON.stringify({complete:val})}); }

// ===== SOUMISSIONS =====
let soumFilt = 'Tous';
async function renderSoumissions() {
  const content = document.getElementById('mainContent');
  const all = await api('/soumissions?company_id='+currentCo);
  const stats = await api('/soumissions/stats?company_id='+currentCo);
  const statMap = {}; stats.forEach(s => { statMap[s.statut] = s; });

  // Badge update
  const sb = document.getElementById('soumBadge');
  if (sb) { const n = statMap['En attente']?.count||0; sb.style.display=n?'flex':'none'; sb.textContent=n; }

  const cols = [{val:'En attente',cls:'kc-att',sc:'ss-att'},{val:'Acceptée',cls:'kc-acc',sc:'ss-acc'},{val:'Refusée',cls:'kc-ref',sc:'ss-ref'},{val:'Révision',cls:'kc-rev',sc:'ss-rev'}];

  content.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">
      ${cols.map(col => { const s=statMap[col.val]||{count:0,total:0}; return `
        <div class="stat-card" style="border-top:3px solid ${{'kc-att':'var(--orange)','kc-acc':'var(--green)','kc-ref':'var(--red)','kc-rev':'var(--purple)'}[col.cls]};cursor:pointer" onclick="soumFilt='${col.val}';setSoumView('list')">
          <div class="stat-val">${s.count||0}</div>
          <div class="stat-label">${col.val}</div>
          ${s.total?`<div class="stat-sub">${fmt(s.total)}</div>`:''}
        </div>`; }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px;flex-wrap:wrap">
      <div class="filter-bar" style="margin:0">
        ${['Tous','En attente','Acceptée','Refusée','Révision'].map(s=>`<button class="filter-btn ${s===soumFilt?'active':''}" onclick="soumFilt='${s}';setSoumView(soumView)">${s}</button>`).join('')}
      </div>
      <div style="display:flex;gap:6px">
        <button class="filter-btn ${soumView==='list'?'active':''}" onclick="setSoumView('list')">≡ Liste</button>
        <button class="filter-btn ${soumView==='kanban'?'active':''}" onclick="setSoumView('kanban')">⊞ Kanban</button>
      </div>
    </div>
    <div id="soumContent"></div>`;
  renderSoumContent(all);
}

function setSoumView(v) { soumView = v; document.querySelectorAll('.filter-btn').forEach(b=>{ if(b.textContent.includes('Liste')) b.classList.toggle('active',v==='list'); if(b.textContent.includes('Kanban')) b.classList.toggle('active',v==='kanban'); }); api('/soumissions?company_id='+currentCo).then(all => renderSoumContent(all)); }

function renderSoumContent(all) {
  const c = document.getElementById('soumContent'); if (!c) return;
  const filtered = soumFilt==='Tous' ? all : all.filter(s=>s.statut===soumFilt);
  if (soumView === 'kanban') {
    const cols = [{val:'En attente',cls:'kc-att'},{val:'Acceptée',cls:'kc-acc'},{val:'Refusée',cls:'kc-ref'},{val:'Révision',cls:'kc-rev'}];
    c.innerHTML = `<div class="kanban-board">${cols.map(col => {
      const items = all.filter(s=>s.statut===col.val);
      return `<div class="kanban-col">
        <div class="kc-head ${col.cls}">${col.val}<span class="kc-count">${items.length}</span></div>
        ${items.map(s=>`<div class="kc-card" onclick="openSoumDetail(${s.id})">
          <div class="kc-card-title">${s.titre}</div>
          <div class="kc-card-client">${s.client||'—'}</div>
          ${s.montant?`<div class="kc-card-amount">${fmt(s.montant)}</div>`:''}
          ${s.date_soumission?`<div style="font-size:11px;color:var(--gray);margin-top:4px">${fd(s.date_soumission)}</div>`:''}
          <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">
            ${s.dossier_nom?`<span class="badge b-navy" style="font-size:10px">${s.dossier_nom.substring(0,20)}</span>`:''}
          </div>
        </div>`).join('')}
      </div>`;
    }).join('')}</div>`;
  } else {
    c.innerHTML = `<div class="cards-list">${filtered.length ? filtered.map(s=>`
      <div class="card ${cardColor(s.statut)}" onclick="openSoumDetail(${s.id})">
        <div class="card-header">
          <div style="flex:1">
            <div class="card-title">${s.titre}</div>
            <div class="card-sub">${s.client||'—'}</div>
            ${s.dossier_nom?`<div style="font-size:12px;color:var(--text3);margin-top:2px">📁 ${s.dossier_nom}</div>`:''}
          </div>
          <div style="text-align:right">
            <div style="font-size:18px;font-weight:900">${fmt(s.montant)}</div>
            ${s.date_soumission?`<div style="font-size:11px;color:var(--gray)">${fd(s.date_soumission)}</div>`:''}
          </div>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:10px">
          <div class="soum-status ${soumStatusClass(s.statut)}"><div class="ss-dot"></div>${s.statut}</div>
          <div style="display:flex;gap:6px">
            <button class="filter-btn" onclick="event.stopPropagation();quickStatut(${s.id},'Acceptée')" style="background:var(--green-lt);color:var(--green-dk);border-color:var(--green-lt)">✓ Acceptée</button>
            <button class="filter-btn" onclick="event.stopPropagation();quickStatut(${s.id},'Refusée')" style="background:var(--red-lt);color:var(--red-dk);border-color:var(--red-lt)">✕ Refusée</button>
          </div>
        </div>
        <div class="card-meta">
          ${s.date_expiration?`<span class="badge b-orange">Exp: ${fd(s.date_expiration)}</span>`:''}
          ${s.representant?`<span class="badge b-gray">👤 ${s.representant}</span>`:''}
        </div>
      </div>`).join('') : `<div class="empty-state"><div class="es-icon">📋</div><h3>Aucune soumission</h3><p>Cliquez sur "+ Nouvelle soumission".</p></div>`}</div>`;
  }
}

async function quickStatut(id, statut) { await api('/soumissions/'+id+'/statut', {method:'PUT',body:JSON.stringify({statut})}); toast('Statut: '+statut+' ✓'); renderSoumissions(); }

function openSoumForm(dossId=null, existing={}) {
  api('/dossiers?company_id='+currentCo).then(doss => {
    _formDoss = doss;
    const html = `
      <div class="fg"><label class="flabel">Titre *</label><input class="finput" id="sTitre" value="${existing.titre||''}" placeholder="Ex: Pompage béton fondation - 45m³"></div>
      <div class="fg"><label class="flabel">Client *</label><input class="finput" id="sClient" value="${existing.client||''}"></div>
      <div class="fg"><label class="flabel">Type de soumission</label><select class="fselect" id="sType" onchange="toggleSoumPo()"><option value="Résidentiel" ${(existing.type||'Résidentiel')==='Résidentiel'?'selected':''}>Résidentiel</option><option value="Commercial" ${existing.type==='Commercial'?'selected':''}>Commercial</option></select></div>
      <div class="fg" id="sPORow" style="display:${existing.type==='Commercial'?'block':'none'}"><label class="flabel">N° PO (client)</label><input class="finput" id="sNumPO" value="${existing.numero_po||''}" placeholder="Ex: PO-2024-001"></div>
      <div class="fg"><label class="flabel">Dossier lié</label><select class="fselect" id="sDoss" onchange="fillClientFromDoss(this.value,'sClient')"><option value="">— Aucun —</option>${doss.map(d=>`<option value="${d.id}" ${(existing.dossier_id||dossId)==d.id?'selected':''}>${d.nom}</option>`).join('')}</select></div>
      <div class="frow">
        <div class="fg"><label class="flabel">Montant ($)</label><input class="finput" id="sMontant" type="number" value="${existing.montant||''}"></div>
        <div class="fg"><label class="flabel">Date soumission</label><input class="finput" id="sDate" type="date" value="${existing.date_soumission||today()}"></div>
      </div>
      <div class="fg"><label class="flabel">Date expiration</label><input class="finput" id="sExp" type="date" value="${existing.date_expiration||''}"></div>
      <div class="fg"><label class="flabel">Représentant</label><input class="finput" id="sRep" value="${existing.representant||''}"></div>
      <div class="fsep"></div><div class="fsec">Statut</div>
      <div class="status-pills" id="soumPills">${['En attente','Acceptée','Refusée','Révision'].map(s=>`<button class="sp sp-${s==='En attente'?'att':s==='Acceptée'?'acc':s==='Refusée'?'ref':'rev'} ${(existing.statut||'En attente')===s?'sel':''}" onclick="pickSoumStatut(this,'${s}')">${s}</button>`).join('')}</div>
      <input type="hidden" id="sStatut" value="${existing.statut||'En attente'}">
      <div class="fg" style="margin-top:12px"><label class="flabel">Notes</label><textarea class="ftextarea" id="sNotes">${existing.notes||''}</textarea></div>`;
    openDrawer(existing.id ? 'Modifier soumission' : 'Nouvelle soumission', html, `
      <button class="btn-prim" onclick="saveSoum(${existing.id||''})">Enregistrer</button>
      ${existing.id?`<button class="btn-danger" onclick="delSoum(${existing.id})">Supprimer</button>`:''}
      <button class="btn-sec" onclick="closeDrawer({target:document.getElementById('drawerOverlay')})">Annuler</button>`);
  });
}

function pickSoumStatut(btn, val) { document.querySelectorAll('#soumPills .sp').forEach(b=>b.classList.remove('sel')); btn.classList.add('sel'); document.getElementById('sStatut').value = val; }

async function saveSoum(id) {
  const data = { company_id: currentCo, titre: fv('sTitre'), client: fv('sClient'), dossier_id: fv('sDoss')||null, montant: fv('sMontant'), date_soumission: fv('sDate'), date_expiration: fv('sExp'), representant: fv('sRep'), statut: fv('sStatut')||'En attente', type: fv('sType')||'Résidentiel', numero_po: fv('sNumPO')||null, notes: fv('sNotes') };
  if (!data.titre || !data.client) { toast('Titre et client requis'); return; }
  try {
    if (id) await api('/soumissions/'+id, {method:'PUT',body:JSON.stringify(data)});
    else await api('/soumissions', {method:'POST',body:JSON.stringify(data)});
    closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Soumission enregistrée ✓'); renderSoumissions();
  } catch(e) { toast(e.message); }
}
async function delSoum(id) { if(!confirm('Supprimer?'))return; await api('/soumissions/'+id,{method:'DELETE'}); closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Supprimée'); renderSoumissions(); }
async function openSoumDetail(id) { const s = await api('/soumissions/'+id); openSoumForm(null, s); }

// ===== BONS DE TRAVAIL =====
let bonFilt = 'Tous';
async function renderBons() {
  const content = document.getElementById('mainContent');
  const params = `company_id=${currentCo}${bonFilt!=='Tous'?'&statut='+bonFilt:''}`;
  const bons = await api('/bons?'+params);
  content.innerHTML = `
    <div class="filter-bar">
      ${['Tous','Ouvert','En cours','Terminé','Facturé'].map(s=>`<button class="filter-btn ${s===bonFilt?'active':''}" onclick="bonFilt='${s}';renderBons()">${s}</button>`).join('')}
    </div>
    <div class="cards-list">${bons.length ? bons.map(b => {
      const total = (b.heures||0)*(b.taux_horaire||0)+(b.cout_materiaux||0);
      return `<div class="card ${cardColor(b.statut)}" onclick="openBonDetail(${b.id})">
        <div class="card-header">
          <div style="flex:1">
            <div class="card-title">BT #${b.numero} <span style="font-weight:400;color:var(--text3)">— ${fd(b.date)}</span></div>
            <div class="card-sub">${b.client||b.dossier_nom||'—'}</div>
            ${b.description?`<div style="font-size:12px;color:var(--text3);margin-top:4px">${b.description.substring(0,80)}${b.description.length>80?'…':''}</div>`:''}
          </div>
          <div style="text-align:right">${badge(b.statut)}<br><div style="font-size:15px;font-weight:800;margin-top:6px">${total?fmt(total):''}</div></div>
        </div>
        <div class="card-meta">
          ${b.heures?`<span class="badge b-blue">⏱ ${b.heures}h</span>`:''}
          ${b.operateur?`<span class="badge b-gray">👤 ${b.operateur}</span>`:''}
          ${b.equipement?`<span class="badge b-navy">🔩 ${b.equipement}</span>`:''}
          ${b.dossier_nom?`<span class="badge b-gray">📁 ${b.dossier_nom.substring(0,25)}</span>`:''}
        </div>
      </div>`;
    }).join('') : `<div class="empty-state"><div class="es-icon">🔧</div><h3>Aucun bon de travail</h3><p>Cliquez sur "+ Nouveau bon".</p></div>`}</div>`;
}

async function openBonDetail(id) { const b = await api('/bons/'+id); openBonForm(b); }

function openBonForm(b={}, dossId=null) {
  api('/dossiers?company_id='+currentCo).then(doss => {
    _formDoss = doss;
    const html = `
      <div class="frow">
        <div class="fg"><label class="flabel">N° bon *</label><input class="finput" id="bNum" value="${b.numero||''}"></div>
        <div class="fg"><label class="flabel">Date</label><input class="finput" id="bDate" type="date" value="${b.date||today()}"></div>
      </div>
      <div class="fg"><label class="flabel">Dossier</label><select class="fselect" id="bDoss" onchange="fillClientFromDoss(this.value,'bClient');fillPoFromDoss(this.value,'bNumPO')"><option value="">— Aucun —</option>${doss.map(d=>`<option value="${d.id}" ${(b.dossier_id||dossId)==d.id?'selected':''}>${d.nom}</option>`).join('')}</select></div>
      <div class="fg"><label class="flabel">Client</label><input class="finput" id="bClient" value="${b.client||''}"></div>
      <div class="fg"><label class="flabel">N° PO</label><input class="finput" id="bNumPO" value="${b.numero_po||''}" placeholder="Laisser vide si aucun"></div>
      <div class="fg"><label class="flabel">Description des travaux</label><textarea class="ftextarea" id="bDesc">${b.description||''}</textarea></div>
      <div class="frow">
        <div class="fg"><label class="flabel">Opérateur</label><input class="finput" id="bOp" value="${b.operateur||''}"></div>
        <div class="fg"><label class="flabel">Équipement</label><input class="finput" id="bEquip" value="${b.equipement||''}"></div>
      </div>
      <div class="frow">
        <div class="fg"><label class="flabel">Heures M.O.</label><input class="finput" id="bHrs" type="number" value="${b.heures||''}" onchange="calcBonTotal()"></div>
        <div class="fg"><label class="flabel">Taux horaire ($)</label><input class="finput" id="bTaux" type="number" value="${b.taux_horaire||''}" onchange="calcBonTotal()"></div>
      </div>
      <div class="fg"><label class="flabel">Coût matériaux ($)</label><input class="finput" id="bMat" type="number" value="${b.cout_materiaux||''}" onchange="calcBonTotal()"></div>
      <div id="bonTotal" style="background:var(--gray2);border-radius:10px;padding:12px;font-size:15px;font-weight:700;margin-bottom:12px"></div>
      <div class="fg"><label class="flabel">Matériaux utilisés</label><textarea class="ftextarea" id="bMatDesc">${b.materiaux||''}</textarea></div>
      <div class="fg"><label class="flabel">Statut</label><select class="fselect" id="bStatut">${['Ouvert','En cours','Terminé','Facturé'].map(s=>`<option ${b.statut===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="fg"><label class="flabel">Notes</label><textarea class="ftextarea" id="bNotes">${b.notes||''}</textarea></div>`;
    openDrawer(b.id ? 'Modifier bon de travail' : 'Nouveau bon de travail', html, `
      <button class="btn-prim" onclick="saveBon(${b.id||''})">Enregistrer</button>
      ${b.id?`<button class="btn-danger" onclick="delBon(${b.id})">Supprimer</button>`:''}
      <button class="btn-sec" onclick="closeDrawer({target:document.getElementById('drawerOverlay')})">Annuler</button>`);
    calcBonTotal();
  });
}
function calcBonTotal() {
  const t = document.getElementById('bonTotal'); if(!t) return;
  const total = (parseFloat(fv('bHrs'))||0)*(parseFloat(fv('bTaux'))||0)+(parseFloat(fv('bMat'))||0);
  t.textContent = 'Total estimé: ' + fmt(total);
}
async function saveBon(id) {
  const data = { company_id: currentCo, numero: fv('bNum'), date: fv('bDate'), dossier_id: fv('bDoss')||null, client: fv('bClient'), numero_po: fv('bNumPO')||null, description: fv('bDesc'), operateur: fv('bOp'), equipement: fv('bEquip'), heures: fv('bHrs'), taux_horaire: fv('bTaux'), cout_materiaux: fv('bMat'), materiaux: fv('bMatDesc'), statut: fv('bStatut'), notes: fv('bNotes') };
  if (!data.numero) { toast('Numéro requis'); return; }
  if (id) await api('/bons/'+id, {method:'PUT',body:JSON.stringify(data)});
  else await api('/bons', {method:'POST',body:JSON.stringify(data)});
  closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Bon enregistré ✓'); renderBons();
}
async function delBon(id) { if(!confirm('Supprimer?'))return; await api('/bons/'+id,{method:'DELETE'}); closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Supprimé'); renderBons(); }

// ===== RAPPORTS =====
async function renderRapports() {
  const content = document.getElementById('mainContent');
  const raps = await api('/rapports?company_id='+currentCo);
  content.innerHTML = `<div class="cards-list">${raps.length ? raps.map(r=>`
    <div class="card ${cardColor(r.statut)}" onclick="openRapDetail(${r.id})">
      <div class="card-header">
        <div style="flex:1">
          <div class="card-title">RS #${r.numero||'—'} — ${fd(r.date)}</div>
          <div class="card-sub">${r.technicien||'—'} · ${r.meteo||''}</div>
          ${r.equipement?`<div style="font-size:12px;color:var(--text3)">🔩 ${r.equipement}</div>`:''}
          ${r.travaux?`<div style="font-size:13px;color:var(--text2);margin-top:6px">${r.travaux.substring(0,100)}…</div>`:''}
        </div>
        <div style="text-align:right">${badge(r.statut)}<br>${r.heures?`<span class="badge b-blue" style="margin-top:4px">⏱ ${r.heures}h</span>`:''}</div>
      </div>
      <div class="card-meta">${r.dossier_nom?`<span class="badge b-navy">📁 ${r.dossier_nom.substring(0,25)}</span>`:''}</div>
    </div>`).join('') : `<div class="empty-state"><div class="es-icon">📊</div><h3>Aucun rapport</h3><p>Cliquez sur "+ Nouveau rapport".</p></div>`}</div>`;
}
async function openRapDetail(id) { const r = await api('/rapports/'+id); openRapForm(r); }
function openRapForm(r={}, dossId=null) {
  api('/dossiers?company_id='+currentCo).then(doss => {
    const html = `
      <div class="frow">
        <div class="fg"><label class="flabel">N° rapport</label><input class="finput" id="rNum" value="${r.numero||''}"></div>
        <div class="fg"><label class="flabel">Date *</label><input class="finput" id="rDate" type="date" value="${r.date||today()}"></div>
      </div>
      <div class="fg"><label class="flabel">Dossier</label><select class="fselect" id="rDoss" onchange="fillDossClientAndPo(this.value)"><option value="">— Aucun —</option>${doss.map(d=>`<option value="${d.id}" ${(r.dossier_id||dossId)==d.id?'selected':''}>${d.nom}</option>`).join('')}</select></div>
      <div class="fg"><label class="flabel">N° PO</label><input class="finput" id="rNumPO" value="${r.numero_po||''}" placeholder="Laisser vide si aucun"></div>
      <div class="frow">
        <div class="fg"><label class="flabel">Technicien</label><input class="finput" id="rTech" value="${r.technicien||''}"></div>
        <div class="fg"><label class="flabel">Équipement</label><input class="finput" id="rEquip" value="${r.equipement||''}"></div>
      </div>
      <div class="fg"><label class="flabel">Travaux réalisés</label><textarea class="ftextarea" id="rTrav" rows="4">${r.travaux||''}</textarea></div>
      <div class="frow">
        <div class="fg"><label class="flabel">Heures sur site</label><input class="finput" id="rHrs" type="number" value="${r.heures||''}"></div>
        <div class="fg"><label class="flabel">Météo</label><select class="fselect" id="rMeteo">${['☀️ Ensoleillé','⛅ Nuageux','🌧️ Pluie','❄️ Neige','🌬️ Vent fort','🥶 Grand froid'].map(m=>`<option ${r.meteo===m?'selected':''}>${m}</option>`).join('')}</select></div>
      </div>
      <div class="fg"><label class="flabel">Température</label><input class="finput" id="rTemp" value="${r.temperature||''}" placeholder="Ex: -5°C"></div>
      <div class="fg"><label class="flabel">Observations / Problèmes</label><textarea class="ftextarea" id="rObs">${r.observations||''}</textarea></div>
      <div class="fg"><label class="flabel">Statut</label><select class="fselect" id="rStatut">${['Brouillon','Complété','Approuvé'].map(s=>`<option ${r.statut===s?'selected':''}>${s}</option>`).join('')}</select></div>`;
    openDrawer(r.id ? 'Modifier rapport' : 'Nouveau rapport de service', html, `
      <button class="btn-prim" onclick="saveRap(${r.id||''})">Enregistrer</button>
      ${r.id?`<button class="btn-danger" onclick="delRap(${r.id})">Supprimer</button>`:''}
      <button class="btn-sec" onclick="closeDrawer({target:document.getElementById('drawerOverlay')})">Annuler</button>`);
  });
}
async function saveRap(id) {
  const data = { company_id: currentCo, numero: fv('rNum'), date: fv('rDate'), dossier_id: fv('rDoss')||null, numero_po: fv('rNumPO')||null, technicien: fv('rTech'), equipement: fv('rEquip'), travaux: fv('rTrav'), heures: fv('rHrs'), meteo: fv('rMeteo'), temperature: fv('rTemp'), observations: fv('rObs'), statut: fv('rStatut') };
  if (!data.date) { toast('Date requise'); return; }
  if (id) await api('/rapports/'+id,{method:'PUT',body:JSON.stringify(data)});
  else await api('/rapports',{method:'POST',body:JSON.stringify(data)});
  closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Rapport enregistré ✓'); renderRapports();
}
async function delRap(id) { if(!confirm('Supprimer?'))return; await api('/rapports/'+id,{method:'DELETE'}); closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Supprimé'); renderRapports(); }

// ===== FACTURES =====
let facFilt = 'Tous', facLignes = [];
async function renderFactures() {
  const content = document.getElementById('mainContent');
  const facs = await api('/factures?company_id='+currentCo+(facFilt!=='Tous'?'&statut='+facFilt:''));
  content.innerHTML = `
    <div class="filter-bar">${['Tous','Brouillon','Envoyée','Payée','En retard'].map(s=>`<button class="filter-btn ${s===facFilt?'active':''}" onclick="facFilt='${s}';renderFactures()">${s}</button>`).join('')}</div>
    <div class="cards-list">${facs.length ? facs.map(f=>`
      <div class="card ${cardColor(f.statut)}" onclick="openFacDetail(${f.id})">
        <div class="card-header">
          <div><div class="card-title">Facture #${f.numero}</div><div class="card-sub">${f.client||'—'}</div>${f.dossier_nom?`<div style="font-size:12px;color:var(--text3)">📁 ${f.dossier_nom}</div>`:''}</div>
          <div style="text-align:right"><div style="font-size:18px;font-weight:900">${fmt(f.total)}</div>${badge(f.statut)}</div>
        </div>
        <div class="card-meta">
          ${f.date?`<span class="badge b-gray">📅 ${fd(f.date)}</span>`:''}
          ${f.date_echeance?`<span class="badge b-orange">Échéance: ${fd(f.date_echeance)}</span>`:''}
          ${f.tps?`<span class="badge b-gray">TPS: ${fmt(f.tps)}</span>`:''}
          ${f.tvq?`<span class="badge b-gray">TVQ: ${fmt(f.tvq)}</span>`:''}
        </div>
      </div>`).join('') : `<div class="empty-state"><div class="es-icon">💳</div><h3>Aucune facture</h3><p>Cliquez sur "+ Nouvelle facture".</p></div>`}</div>`;
}
async function openFacDetail(id) { const f = await api('/factures/'+id); openFacForm(null, f); }
function openFacForm(dossId=null, f={lignes:[]}) {
  facLignes = f.lignes || [{description:'',quantite:1,unite:'unité',prix_unitaire:0}];
  api('/dossiers?company_id='+currentCo).then(doss => {
    _formDoss = doss;
    const html = `
      <div class="frow">
        <div class="fg"><label class="flabel">N° facture</label><input class="finput" id="fNum" value="${f.numero||''}"></div>
        <div class="fg"><label class="flabel">Date</label><input class="finput" id="fDate" type="date" value="${f.date||today()}"></div>
      </div>
      <div class="frow">
        <div class="fg"><label class="flabel">Date échéance</label><input class="finput" id="fEch" type="date" value="${f.date_echeance||''}"></div>
        <div class="fg"><label class="flabel">Statut</label><select class="fselect" id="fStatut">${['Brouillon','Envoyée','Payée','En retard'].map(s=>`<option ${f.statut===s?'selected':''}>${s}</option>`).join('')}</select></div>
      </div>
      <div class="fg"><label class="flabel">Client</label><input class="finput" id="fClient" value="${f.client||''}"></div>
      <div class="fg"><label class="flabel">Dossier</label><select class="fselect" id="fDoss" onchange="fillClientFromDoss(this.value,'fClient');fillPoFromDoss(this.value,'fNumPO')"><option value="">— Aucun —</option>${doss.map(d=>`<option value="${d.id}" ${(f.dossier_id||dossId)==d.id?'selected':''}>${d.nom}</option>`).join('')}</select></div>
      <div class="fsep"></div><div class="fsec">Lignes de facturation</div>
      <div id="facLignesDiv"></div>
      <button class="btn-sec" onclick="addFacLigne()" style="margin-bottom:12px">+ Ajouter une ligne</button>
      <div id="facTotaux" style="background:var(--gray2);border-radius:10px;padding:14px;font-size:14px"></div>
      <div class="fg" style="margin-top:12px"><label class="flabel">Notes</label><textarea class="ftextarea" id="fNotes">${f.notes||''}</textarea></div>`;
    openDrawer(f.id?'Modifier facture':'Nouvelle facture', html, `
      <button class="btn-prim" onclick="saveFac(${f.id||''})">Enregistrer</button>
      ${f.id?`<button class="btn-danger" onclick="delFac(${f.id})">Supprimer</button>`:''}
      <button class="btn-sec" onclick="closeDrawer({target:document.getElementById('drawerOverlay')})">Annuler</button>`);
    renderFacLignes();
  });
}
function renderFacLignes() {
  const c = document.getElementById('facLignesDiv'); if(!c) return;
  c.innerHTML = facLignes.map((l,i)=>`<div class="fac-line" style="margin-bottom:8px">
    <input class="finput" style="flex:3" placeholder="Description" value="${l.description||''}" onchange="facLignes[${i}].description=this.value;calcFac()">
    <input class="finput" style="flex:1;width:60px" type="number" placeholder="Qté" value="${l.quantite||1}" onchange="facLignes[${i}].quantite=parseFloat(this.value)||1;calcFac()">
    <input class="finput" style="flex:2" type="number" placeholder="Prix unit." value="${l.prix_unitaire||''}" onchange="facLignes[${i}].prix_unitaire=parseFloat(this.value)||0;calcFac()">
    <button onclick="facLignes.splice(${i},1);renderFacLignes()" style="background:var(--red-lt);color:var(--red-dk);border:none;border-radius:8px;padding:8px 12px;cursor:pointer">✕</button>
  </div>`).join('');
  calcFac();
}
function addFacLigne() { facLignes.push({description:'',quantite:1,unite:'unité',prix_unitaire:0}); renderFacLignes(); }
function calcFac() {
  const st = document.getElementById('facTotaux'); if(!st) return;
  const sous = facLignes.reduce((a,l)=>a+(l.quantite||1)*(l.prix_unitaire||0),0);
  const tps = sous*0.05, tvq = sous*0.09975, total = sous+tps+tvq;
  st.innerHTML = `<div style="display:flex;justify-content:space-between"><span>Sous-total</span><strong>${fmt(sous)}</strong></div>
    <div style="display:flex;justify-content:space-between"><span>TPS (5%)</span><strong>${fmt(tps)}</strong></div>
    <div style="display:flex;justify-content:space-between"><span>TVQ (9,975%)</span><strong>${fmt(tvq)}</strong></div>
    <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:900;border-top:2px solid var(--text);margin-top:8px;padding-top:8px"><span>TOTAL</span><strong>${fmt(total)}</strong></div>`;
}
async function saveFac(id) {
  const sous = facLignes.reduce((a,l)=>a+(l.quantite||1)*(l.prix_unitaire||0),0);
  const data = { company_id: currentCo, numero: fv('fNum'), date: fv('fDate'), date_echeance: fv('fEch'), statut: fv('fStatut'), client: fv('fClient'), dossier_id: fv('fDoss')||null, numero_po: fv('fNumPO')||null, sous_total: sous, notes: fv('fNotes'), lignes: facLignes };
  if (id) await api('/factures/'+id,{method:'PUT',body:JSON.stringify(data)});
  else await api('/factures',{method:'POST',body:JSON.stringify(data)});
  closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Facture enregistrée ✓'); renderFactures();
}
async function delFac(id) { if(!confirm('Supprimer?'))return; await api('/factures/'+id,{method:'DELETE'}); closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Supprimée'); renderFactures(); }

// ===== CONTACTS =====
let contFilt = 'Tous';
async function renderContacts() {
  const content = document.getElementById('mainContent');
  const conts = await api('/contacts?company_id='+currentCo+(contFilt!=='Tous'?'&type='+contFilt:''));
  content.innerHTML = `
    <div class="filter-bar">${['Tous','Client','Fournisseur','Sous-traitant','Employé','Représentant'].map(s=>`<button class="filter-btn ${s===contFilt?'active':''}" onclick="contFilt='${s}';renderContacts()">${s}</button>`).join('')}</div>
    <div class="cards-list">${conts.length ? conts.map(c=>`
      <div class="card cl-blue" onclick="openContDetail(${c.id})">
        <div class="card-header">
          <div><div class="card-title">${c.nom}</div>${c.entreprise?`<div class="card-sub">${c.entreprise}</div>`:''}</div>
          ${badge(c.type)}
        </div>
        <div class="card-meta">
          ${c.tel?`<a href="tel:${c.tel}" onclick="event.stopPropagation()" class="badge b-gray" style="text-decoration:none">📞 ${c.tel}</a>`:''}
          ${c.cell?`<a href="tel:${c.cell}" onclick="event.stopPropagation()" class="badge b-gray" style="text-decoration:none">📱 ${c.cell}</a>`:''}
          ${c.email?`<a href="mailto:${c.email}" onclick="event.stopPropagation()" class="badge b-gray" style="text-decoration:none">✉️ ${c.email}</a>`:''}
        </div>
      </div>`).join('') : `<div class="empty-state"><div class="es-icon">👥</div><h3>Aucun contact</h3><p>Cliquez sur "+ Nouveau contact".</p></div>`}</div>`;
}
async function openContDetail(id) { const c = await api('/contacts/'+id); openContForm(c); }
function openContForm(c={}) {
  openDrawer(c.id?'Modifier contact':'Nouveau contact', `
    <div class="fg"><label class="flabel">Nom *</label><input class="finput" id="cNom" value="${c.nom||''}"></div>
    <div class="fg"><label class="flabel">Entreprise</label><input class="finput" id="cEntr" value="${c.entreprise||''}"></div>
    <div class="fg"><label class="flabel">Type</label><select class="fselect" id="cType">${['Client','Fournisseur','Sous-traitant','Employé','Représentant','Autre'].map(s=>`<option ${c.type===s?'selected':''}>${s}</option>`).join('')}</select></div>
    <div class="frow"><div class="fg"><label class="flabel">Téléphone</label><input class="finput" id="cTel" type="tel" value="${c.tel||''}"></div><div class="fg"><label class="flabel">Cellulaire</label><input class="finput" id="cCell" type="tel" value="${c.cell||''}"></div></div>
    <div class="fg"><label class="flabel">Courriel</label><input class="finput" id="cEmail" type="email" value="${c.email||''}"></div>
    <div class="fg"><label class="flabel">Adresse</label><input class="finput" id="cAddr" value="${c.adresse||''}"></div>
    <div class="fg"><label class="flabel">Notes</label><textarea class="ftextarea" id="cNotes">${c.notes||''}</textarea></div>`,
    `<button class="btn-prim" onclick="saveCont(${c.id||''})">Enregistrer</button>
    ${c.id?`<button class="btn-danger" onclick="delCont(${c.id})">Supprimer</button>`:''}
    <button class="btn-sec" onclick="closeDrawer({target:document.getElementById('drawerOverlay')})">Annuler</button>`);
}
async function saveCont(id) {
  const data = { company_id: currentCo, nom: fv('cNom'), entreprise: fv('cEntr'), type: fv('cType'), tel: fv('cTel'), cell: fv('cCell'), email: fv('cEmail'), adresse: fv('cAddr'), notes: fv('cNotes') };
  if (!data.nom) { toast('Nom requis'); return; }
  if (id) await api('/contacts/'+id,{method:'PUT',body:JSON.stringify(data)});
  else await api('/contacts',{method:'POST',body:JSON.stringify(data)});
  closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Contact enregistré ✓'); renderContacts();
}
async function delCont(id) { if(!confirm('Supprimer?'))return; await api('/contacts/'+id,{method:'DELETE'}); closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Supprimé'); renderContacts(); }

// ===== FEUILLES DE TEMPS =====
async function renderTemps() {
  const content = document.getElementById('mainContent');
  const temps = await api('/temps?company_id='+currentCo);
  const total = temps.reduce((a,t)=>a+Number(t.heures||0),0);
  const totalMontant = temps.reduce((a,t)=>a+(Number(t.heures||0)*Number(t.taux||0)),0);
  content.innerHTML = `
    <div style="display:flex;gap:14px;margin-bottom:20px">
      <div class="stat-card sc-blue"><div class="stat-val">${total.toFixed(1)}</div><div class="stat-label">Heures totales</div></div>
      <div class="stat-card sc-green"><div class="stat-val">${fmt(totalMontant)}</div><div class="stat-label">Montant total</div></div>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Employé</th><th>Dossier</th><th>Heures</th><th>Taux</th><th>Total</th><th>Description</th></tr></thead>
      <tbody>${temps.map(t=>`<tr>
        <td>${fd(t.date)}</td><td>${t.employe||'—'}</td><td>${t.dossier_nom||'—'}</td>
        <td>${t.heures||0}h</td><td>${fmt(t.taux)}</td><td>${fmt((t.heures||0)*(t.taux||0))}</td>
        <td>${t.description||'—'}</td>
      </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--gray)">Aucune entrée</td></tr>'}</tbody>
    </table></div>`;
}
function openTempsForm() {
  api('/dossiers?company_id='+currentCo).then(doss => {
    openDrawer('Ajouter des heures', `
      <div class="fg"><label class="flabel">Employé</label><input class="finput" id="tEmp" value="${user.nom}"></div>
      <div class="fg"><label class="flabel">Dossier</label><select class="fselect" id="tDoss"><option value="">— Aucun —</option>${doss.map(d=>`<option value="${d.id}">${d.nom}</option>`).join('')}</select></div>
      <div class="frow"><div class="fg"><label class="flabel">Date</label><input class="finput" id="tDate" type="date" value="${today()}"></div><div class="fg"><label class="flabel">Heures</label><input class="finput" id="tHrs" type="number" step="0.5" placeholder="0"></div></div>
      <div class="fg"><label class="flabel">Taux horaire ($)</label><input class="finput" id="tTaux" type="number" placeholder="0"></div>
      <div class="fg"><label class="flabel">Description</label><input class="finput" id="tDesc" placeholder="Description du travail"></div>`,
      `<button class="btn-prim" onclick="saveTemps()">Enregistrer</button><button class="btn-sec" onclick="closeDrawer({target:document.getElementById('drawerOverlay')})">Annuler</button>`);
  });
}
async function saveTemps() {
  const data = { company_id: currentCo, employe: fv('tEmp'), dossier_id: fv('tDoss')||null, date: fv('tDate'), heures: fv('tHrs'), taux: fv('tTaux'), description: fv('tDesc') };
  await api('/temps',{method:'POST',body:JSON.stringify(data)});
  closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Heures enregistrées ✓'); renderTemps();
}

// ===== USERS =====
async function renderUsers() {
  if (user.role !== 'admin') { document.getElementById('mainContent').innerHTML = '<div class="empty-state"><div class="es-icon">🔒</div><h3>Accès réservé aux administrateurs</h3></div>'; return; }
  const users = await api('/users');
  document.getElementById('mainContent').innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>Nom</th><th>Courriel</th><th>Rôle</th><th>Statut</th><th></th></tr></thead>
    <tbody>${users.map(u=>`<tr>
      <td>${u.nom}</td><td>${u.email}</td>
      <td>${badge(u.role==='admin'?'Administrateur':'Employé')}</td>
      <td>${u.actif?'<span class="badge b-green">Actif</span>':'<span class="badge b-red">Inactif</span>'}</td>
      <td><button class="filter-btn" onclick="openUserForm(${JSON.stringify(u).replace(/"/g,'&quot;')})">Modifier</button></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}
function openUserForm(u={}) {
  openDrawer(u.id?'Modifier utilisateur':'Nouvel utilisateur', `
    <div class="fg"><label class="flabel">Nom *</label><input class="finput" id="uNom" value="${u.nom||''}"></div>
    <div class="fg"><label class="flabel">Courriel *</label><input class="finput" id="uEmail" type="email" value="${u.email||''}"></div>
    <div class="fg"><label class="flabel">Mot de passe ${u.id?'(laisser vide = inchangé)':'*'}</label><input class="finput" id="uPwd" type="password" placeholder="••••••••"></div>
    <div class="fg"><label class="flabel">Rôle</label><select class="fselect" id="uRole"><option value="employe" ${u.role==='employe'?'selected':''}>Employé</option><option value="admin" ${u.role==='admin'?'selected':''}>Administrateur</option></select></div>
    ${u.id?`<div class="fg"><label class="flabel">Statut</label><select class="fselect" id="uActif"><option value="1" ${u.actif?'selected':''}>Actif</option><option value="0" ${!u.actif?'selected':''}>Inactif</option></select></div>`:''}`,
    `<button class="btn-prim" onclick="saveUser(${u.id||''})">Enregistrer</button>
    <button class="btn-sec" onclick="closeDrawer({target:document.getElementById('drawerOverlay')})">Annuler</button>`);
}
async function saveUser(id) {
  const data = { nom: fv('uNom'), email: fv('uEmail'), role: fv('uRole'), actif: fv('uActif')!=='0', password: fv('uPwd') };
  if (!data.nom || !data.email) { toast('Nom et courriel requis'); return; }
  try {
    if (id) await api('/users/'+id,{method:'PUT',body:JSON.stringify(data)});
    else await api('/users',{method:'POST',body:JSON.stringify(data)});
    closeDrawer({target:document.getElementById('drawerOverlay')}); toast('Utilisateur enregistré ✓'); renderUsers();
  } catch(e) { toast(e.message); }
}

// ===== AUTH =====
async function logout() { await api('/auth/logout',{method:'POST'}); window.location='/'; }

// ===== START =====
init();
