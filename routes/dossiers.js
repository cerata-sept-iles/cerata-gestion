const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', (req, res) => {
  const { company_id, statut, search } = req.query;
  let sql = 'SELECT * FROM dossiers WHERE 1=1';
  const params = [];
  if (company_id) { sql += ' AND company_id = ?'; params.push(company_id); }
  if (statut && statut !== 'Tous') { sql += ' AND statut = ?'; params.push(statut); }
  if (search) { sql += ' AND (nom LIKE ? OR client LIKE ? OR numero LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
  sql += ' ORDER BY created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const d = db.prepare('SELECT * FROM dossiers WHERE id = ?').get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Non trouvé' });
  res.json(d);
});

router.post('/', (req, res) => {
  const b = req.body;
  const numero = b.numero || genNum('DOS');
  const r = db.prepare(`INSERT INTO dossiers (company_id,numero,nom,statut,client,contact,tel,cell,fax,email,adresse_client,adresse_travaux,langue,type_travaux,categorie,representant,gestionnaire,priorite,couleur,date_debut,date_fin,avancement,budget,description,notes,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    b.company_id, numero, b.nom, b.statut||'En cours', b.client, b.contact, b.tel, b.cell, b.fax, b.email,
    b.adresse_client, b.adresse_travaux, b.langue||'Français', b.type_travaux, b.categorie,
    b.representant, b.gestionnaire, b.priorite||'Normale', b.couleur, b.date_debut, b.date_fin,
    b.avancement||0, b.budget||0, b.description, b.notes, req.session.userId
  );
  res.json({ id: r.lastInsertRowid, numero });
});

router.put('/:id', (req, res) => {
  const b = req.body;
  db.prepare(`UPDATE dossiers SET nom=?,statut=?,client=?,contact=?,tel=?,cell=?,fax=?,email=?,adresse_client=?,adresse_travaux=?,langue=?,type_travaux=?,categorie=?,representant=?,gestionnaire=?,priorite=?,couleur=?,date_debut=?,date_fin=?,avancement=?,budget=?,description=?,notes=?,updated_at=datetime('now') WHERE id=?`).run(
    b.nom, b.statut, b.client, b.contact, b.tel, b.cell, b.fax, b.email, b.adresse_client, b.adresse_travaux,
    b.langue, b.type_travaux, b.categorie, b.representant, b.gestionnaire, b.priorite, b.couleur,
    b.date_debut, b.date_fin, b.avancement, b.budget, b.description, b.notes, req.params.id
  );
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM dossiers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Notes
router.get('/:id/notes', (req, res) => {
  res.json(db.prepare('SELECT * FROM notes_dossier WHERE dossier_id = ? ORDER BY created_at DESC').all(req.params.id));
});
router.post('/:id/notes', (req, res) => {
  const r = db.prepare('INSERT INTO notes_dossier (dossier_id, contenu, auteur) VALUES (?, ?, ?)').run(req.params.id, req.body.content, req.session.nom);
  res.json({ id: r.lastInsertRowid });
});

// Checklist
router.get('/:id/checklist', (req, res) => {
  res.json(db.prepare('SELECT * FROM checklist WHERE dossier_id = ? ORDER BY ordre').all(req.params.id));
});
router.post('/:id/checklist', (req, res) => {
  const r = db.prepare('INSERT INTO checklist (dossier_id, item, ordre) VALUES (?, ?, ?)').run(req.params.id, req.body.item, req.body.ordre||0);
  res.json({ id: r.lastInsertRowid });
});
router.put('/checklist/:itemId', (req, res) => {
  db.prepare('UPDATE checklist SET complete = ? WHERE id = ?').run(req.body.complete ? 1 : 0, req.params.itemId);
  res.json({ success: true });
});
router.delete('/checklist/:itemId', (req, res) => {
  db.prepare('DELETE FROM checklist WHERE id = ?').run(req.params.itemId);
  res.json({ success: true });
});

// Feuilles de temps par dossier
router.get('/:id/temps', (req, res) => {
  res.json(db.prepare('SELECT * FROM feuilles_temps WHERE dossier_id = ? ORDER BY date DESC').all(req.params.id));
});

function genNum(prefix) {
  const d = new Date();
  return `${prefix}-${d.getFullYear().toString().slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*900+100)}`;
}

module.exports = router;
