const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', (req, res) => {
  const { company_id, statut, dossier_id } = req.query;
  let sql = `SELECT b.*, d.nom as dossier_nom FROM bons_travail b LEFT JOIN dossiers d ON b.dossier_id = d.id WHERE 1=1`;
  const params = [];
  if (company_id) { sql += ' AND b.company_id = ?'; params.push(company_id); }
  if (statut && statut !== 'Tous') { sql += ' AND b.statut = ?'; params.push(statut); }
  if (dossier_id) { sql += ' AND b.dossier_id = ?'; params.push(dossier_id); }
  sql += ' ORDER BY b.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/', (req, res) => {
  const b = req.body;
  const r = db.prepare(`INSERT INTO bons_travail (company_id,dossier_id,numero,date,client,numero_po,description,operateur,equipement,heures,taux_horaire,cout_materiaux,materiaux,statut,notes,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    b.company_id, b.dossier_id||null, b.numero, b.date, b.client, b.numero_po||null,
    b.description, b.operateur, b.equipement, b.heures||0, b.taux_horaire||0, b.cout_materiaux||0,
    b.materiaux, b.statut||'Ouvert', b.notes, req.session.userId
  );
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const b = req.body;
  db.prepare(`UPDATE bons_travail SET dossier_id=?,numero=?,date=?,client=?,numero_po=?,description=?,operateur=?,equipement=?,heures=?,taux_horaire=?,cout_materiaux=?,materiaux=?,statut=?,notes=? WHERE id=?`).run(
    b.dossier_id||null, b.numero, b.date, b.client, b.numero_po||null, b.description,
    b.operateur, b.equipement, b.heures, b.taux_horaire, b.cout_materiaux, b.materiaux,
    b.statut, b.notes, req.params.id
  );
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM bons_travail WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
