const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', (req, res) => {
  const { company_id, statut, dossier_id } = req.query;
  let sql = `SELECT r.*, d.nom as dossier_nom FROM rapports_service r LEFT JOIN dossiers d ON r.dossier_id = d.id WHERE 1=1`;
  const params = [];
  if (company_id) { sql += ' AND r.company_id = ?'; params.push(company_id); }
  if (statut && statut !== 'Tous') { sql += ' AND r.statut = ?'; params.push(statut); }
  if (dossier_id) { sql += ' AND r.dossier_id = ?'; params.push(dossier_id); }
  sql += ' ORDER BY r.date DESC, r.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/', (req, res) => {
  const b = req.body;
  const r = db.prepare(`INSERT INTO rapports_service (company_id,dossier_id,numero,date,technicien,equipement,numero_po,travaux,heures,meteo,temperature,observations,statut,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    b.company_id, b.dossier_id||null, b.numero, b.date, b.technicien, b.equipement,
    b.numero_po||null, b.travaux, b.heures||0, b.meteo, b.temperature, b.observations,
    b.statut||'Brouillon', req.session.userId
  );
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const b = req.body;
  db.prepare(`UPDATE rapports_service SET dossier_id=?,numero=?,date=?,technicien=?,equipement=?,numero_po=?,travaux=?,heures=?,meteo=?,temperature=?,observations=?,statut=? WHERE id=?`).run(
    b.dossier_id||null, b.numero, b.date, b.technicien, b.equipement, b.numero_po||null,
    b.travaux, b.heures, b.meteo, b.temperature, b.observations, b.statut, req.params.id
  );
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM rapports_service WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
