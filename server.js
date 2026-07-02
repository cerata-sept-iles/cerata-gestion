const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Render/proxy HTTPS (required for secure cookies)
app.set('trust proxy', 1);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sessions
app.use(session({
store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
secret: process.env.SESSION_SECRET || 'cerata-secret-2024-!@#',
resave: false,
saveUninitialized: false,
cookie: {
secure: process.env.NODE_ENV === 'production',
httpOnly: true,
maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
}
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dossiers', require('./routes/dossiers'));
app.use('/api/soumissions', require('./routes/soumissions'));
app.use('/api/bons', require('./routes/bons'));
app.use('/api/rapports', require('./routes/rapports'));
app.use('/api/factures', require('./routes/factures'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/catalogue', require('./routes/catalogue'));

// Companies list
const db = require('./database');
app.get('/api/companies', (req, res) => {
res.json(db.prepare('SELECT * FROM companies').all());
});

// PO unifié: cherche dans bons → rapports → soumissions pour un dossier
const { requireAuth } = require('./middleware/auth');
app.get('/api/dossiers/:id/po', requireAuth, (req, res) => {
const did = req.params.id;
const bon = db.prepare("SELECT numero_po FROM bons_travail WHERE dossier_id=? AND numero_po IS NOT NULL AND numero_po != '' ORDER BY created_at DESC LIMIT 1").get(did);
if (bon) return res.json({ numero_po: bon.numero_po });
const rap = db.prepare("SELECT numero_po FROM rapports_service WHERE dossier_id=? AND numero_po IS NOT NULL AND numero_po != '' ORDER BY created_at DESC LIMIT 1").get(did);
if (rap) return res.json({ numero_po: rap.numero_po });
const soum = db.prepare("SELECT numero_po FROM soumissions WHERE dossier_id=? AND type='Commercial' AND statut='Acceptée' AND numero_po IS NOT NULL AND numero_po != '' ORDER BY created_at DESC LIMIT 1").get(did);
res.json({ numero_po: soum ? soum.numero_po : null });
});

// Feuilles de temps
app.get('/api/temps', requireAuth, (req, res) => {
const { company_id, dossier_id } = req.query;
let sql = 'SELECT t.*, d.nom as dossier_nom FROM feuilles_temps t LEFT JOIN dossiers d ON t.dossier_id = d.id WHERE 1=1';
const params = [];
if (company_id) { sql += ' AND t.company_id = ?'; params.push(company_id); }
if (dossier_id) { sql += ' AND t.dossier_id = ?'; params.push(dossier_id); }
sql += ' ORDER BY t.date DESC';
res.json(db.prepare(sql).all(...params));
});
app.post('/api/temps', requireAuth, (req, res) => {
const b = req.body;
const r = db.prepare('INSERT INTO feuilles_temps (company_id,dossier_id,employe,date,heures,taux,description,created_by) VALUES (?,?,?,?,?,?,?,?)').run(b.company_id, b.dossier_id||null, b.employe, b.date, b.heures||0, b.taux||0, b.description, req.session.userId);
res.json({ id: r.lastInsertRowid });
});
app.delete('/api/temps/:id', requireAuth, (req, res) => {
db.prepare('DELETE FROM feuilles_temps WHERE id = ?').run(req.params.id);
res.json({ success: true });
});

// Dashboard stats
app.get('/api/dashboard', requireAuth, (req, res) => {
const { company_id } = req.query;
const cond = company_id ? 'AND company_id = ?' : '';
const p = company_id ? [company_id] : [];
const stats = {
dossiers_actifs: db.prepare(`SELECT COUNT(*) as n FROM dossiers WHERE statut='En cours' ${cond}`).get(...p)?.n || 0,
soum_attente: db.prepare(`SELECT COUNT(*) as n, SUM(montant) as total FROM soumissions WHERE statut='En attente' ${cond}`).get(...p),
soum_acceptees: db.prepare(`SELECT COUNT(*) as n, SUM(montant) as total FROM soumissions WHERE statut='Acceptée' ${cond}`).get(...p),
bons_actifs: db.prepare(`SELECT COUNT(*) as n FROM bons_travail WHERE statut IN ('Ouvert','En cours') ${cond}`).get(...p)?.n || 0,
factures_impayees: db.prepare(`SELECT COUNT(*) as n, SUM(total) as total FROM factures WHERE statut IN ('Envoyée','En retard') ${cond}`).get(...p),
soumissions_recentes: db.prepare(`SELECT * FROM soumissions WHERE 1=1 ${cond} ORDER BY created_at DESC LIMIT 5`).all(...p),
dossiers_recents: db.prepare(`SELECT * FROM dossiers WHERE 1=1 ${cond} ORDER BY created_at DESC LIMIT 5`).all(...p),
};
res.json(stats);
});

// SPA fallback
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
console.log(`\n🏗️ Cerata Gestion démarré sur http://localhost:${PORT}`);
console.log(`📧 Admin: info@cerata.ca | Mot de passe: Cerata2024!\n`);
});
