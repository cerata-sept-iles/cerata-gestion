const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', (req, res) => {
  const { company_id, statut, search } = req.query;
  let sql = `SELECT s.*, d.nom as dossier_nom FROM soumissions s LEFT JOIN dossiers d ON s.dossier_id = d.id WHERE 1=1`;
  const params = [];
  if (company_id) { sql += ' AND s.company_id = ?'; params.push(company_id); }
  if (statut && statut !== 'Tous') { sql += ' AND s.statut = ?'; params.push(statut); }
  if (search) { sql += ' AND (s.titre LIKE ? OR s.client LIKE ?)'; const s2 = `%${search}%`; params.push(s2, s2); }
  sql += ' ORDER BY s.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/po/:dossier_id', (req, res) => {
  const s = db.prepare(`SELECT numero_po FROM soumissions WHERE dossier_id=? AND type='Commercial' AND statut='Acceptée' AND numero_po IS NOT NULL AND numero_po != '' ORDER BY created_at DESC LIMIT 1`).get(req.params.dossier_id);
  res.json({ numero_po: s ? s.numero_po : null });
});

router.get('/stats', (req, res) => {
  const { company_id } = req.query;
  const cond = company_id ? 'WHERE company_id = ?' : 'WHERE 1=1';
  const params = company_id ? [company_id] : [];
  const stats = db.prepare(`SELECT statut, COUNT(*) as count, SUM(montant) as total FROM soumissions ${cond} GROUP BY statut`).all(...params);
  res.json(stats);
});

router.post('/', (req, res) => {
  const b = req.body;
  const r = db.prepare(`INSERT INTO soumissions (company_id,dossier_id,numero,titre,client,montant,date_soumission,date_expiration,statut,representant,type_travaux,type,numero_po,description,notes,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    b.company_id, b.dossier_id||null, b.numero||genNum(), b.titre, b.client, b.montant||0,
    b.date_soumission, b.date_expiration, b.statut||'En attente', b.representant,
    b.type_travaux, b.type||'Résidentiel', b.numero_po||null, b.description, b.notes, req.session.userId
  );
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const b = req.body;
  db.prepare(`UPDATE soumissions SET dossier_id=?,titre=?,client=?,montant=?,date_soumission=?,date_expiration=?,statut=?,representant=?,type_travaux=?,type=?,numero_po=?,description=?,notes=? WHERE id=?`).run(
    b.dossier_id||null, b.titre, b.client, b.montant, b.date_soumission, b.date_expiration,
    b.statut, b.representant, b.type_travaux, b.type||'Résidentiel', b.numero_po||null,
    b.description, b.notes, req.params.id
  );
  res.json({ success: true });
});

router.put('/:id/statut', (req, res) => {
  db.prepare('UPDATE soumissions SET statut = ? WHERE id = ?').run(req.body.statut, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM soumissions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

function genNum() {
  const d = new Date();
  return `SOM-${d.getFullYear().toString().slice(2)}${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*900+100)}`;
}

module.exports = router;
