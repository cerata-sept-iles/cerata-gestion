const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', (req, res) => {
  const { company_id, type, search } = req.query;
  let sql = 'SELECT * FROM contacts WHERE 1=1';
  const params = [];
  if (company_id) { sql += ' AND company_id = ?'; params.push(company_id); }
  if (type && type !== 'Tour') { sql += ' AND type = ?'; params.push(type); }
  if (search) { sql += ' AND (nom LIKE ? OR entreprise LIKE ?)'; const s = `%${search}%`; params.push(s, s); }
  sql += ' ORDER BY nom';
  res.json(db.prepare(sql).all(...params));
});

router.post('/', (req, res) => {
  const b = req.body;
  const r = db.prepare('INSERT INTO contacts (company_id,nom,entreprise,type,tel,cell,email,adresse,notes) VALUES (?,?,?,?,?,?,?,?,?)').run(b.company_id,b.nom,b.entreprise,b.type||'Client',b.tel,b.cell,b.email,b.adresse,b.notes);
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const b = req.body;
  db.prepare('UPDATE contacts SET nom=?,entreprise=?,type=?,tel=?,cell=?,email=?,adresse=?,notes=? WHERE id=?').run(b.nom,b.entreprise,b.type,b.tel,b.cell,b.email,b.adresse,b.notes,req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
