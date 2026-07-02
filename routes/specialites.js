const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', (req, res) => {
  const { company_id } = req.query;
  let sql = 'SELECT * FROM specialites WHERE 1=1';
  const params = [];
  if (company_id) { sql += ' AND company_id = ?'; params.push(company_id); }
  sql += ' ORDER BY ordre, nom COLLATE NOCASE';
  res.json(db.prepare(sql).all(...params));
});

router.post('/', (req, res) => {
  const { company_id, nom, couleur, ordre } = req.body;
  if (!company_id || !nom) return res.status(400).json({ error: 'company_id et nom requis' });
  const r = db.prepare('INSERT INTO specialites (company_id, nom, couleur, ordre) VALUES (?,?,?,?)').run(
    company_id, nom, couleur || '#3b82f6', ordre || 0
  );
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { nom, couleur, ordre } = req.body;
  db.prepare('UPDATE specialites SET nom=?, couleur=?, ordre=? WHERE id=?').run(
    nom, couleur || '#3b82f6', ordre || 0, req.params.id
  );
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  // Clear references before deleting
  db.prepare('UPDATE dossiers SET specialite_id = NULL WHERE specialite_id = ?').run(req.params.id);
  db.prepare('UPDATE soumissions SET specialite_id = NULL WHERE specialite_id = ?').run(req.params.id);
  db.prepare('DELETE FROM specialites WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
