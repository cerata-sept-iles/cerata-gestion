const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', (req, res) => {
  const { company_id, statut } = req.query;
  let sql = `SELECT f.*, d.nom as dossier_nom FROM factures f LEFT JOIN dossiers d ON f.dossier_id = d.id WHERE 1=1`;
  const params = [];
  if (company_id) { sql += ' AND f.company_id = ?'; params.push(company_id); }
  if (statut && statut !== 'Tous') { sql += ' AND f.statut = ?'; params.push(statut); }
  sql += ' ORDER BY f.created_at DESC';
  const factures = db.prepare(sql).all(...params);
  factures.forEach(f => {
    f.lignes = db.prepare('SELECT * FROM facture_lignes WHERE facture_id = ?').all(f.id);
  });
  res.json(factures);
});

router.post('/', (req, res) => {
  const b = req.body;
  const tps = (b.sous_total || 0) * 0.05;
  const tvq = (b.sous_total || 0) * 0.09975;
  const total = (b.sous_total || 0) + tps + tvq;
  const r = db.prepare(`INSERT INTO factures (company_id,dossier_id,soumission_id,numero,date,date_echeance,client,adresse_client,description,sous_total,tps,tvq,total,statut,notes,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    b.company_id, b.dossier_id||null, b.soumission_id||null, b.numero||genNum(), b.date, b.date_echeance,
    b.client, b.adresse_client, b.description, b.sous_total||0, tps, tvq, total,
    b.statut||'Brouillon', b.notes, req.session.userId
  );
  const fid = r.lastInsertRowid;
  if (b.lignes && Array.isArray(b.lignes)) {
    const ins = db.prepare('INSERT INTO facture_lignes (facture_id,description,quantite,unite,prix_unitaire,total) VALUES (?,?,?,?,?,?)');
    b.lignes.forEach(l => ins.run(fid, l.description, l.quantite||1, l.unite||'unité', l.prix_unitaire||0, (l.quantite||1)*(l.prix_unitaire||0)));
  }
  res.json({ id: fid });
});

router.put('/:id', (req, res) => {
  const b = req.body;
  const tps = (b.sous_total || 0) * 0.05;
  const tvq = (b.sous_total || 0) * 0.09975;
  const total = (b.sous_total || 0) + tps + tvq;
  db.prepare(`UPDATE factures SET dossier_id=?,numero=?,date=?,date_echeance=?,client=?,adresse_client=?,description=?,sous_total=?,tps=?,tvq=?,total=?,statut=?,notes=? WHERE id=?`).run(
    b.dossier_id||null, b.numero, b.date, b.date_echeance, b.client, b.adresse_client,
    b.description, b.sous_total, tps, tvq, total, b.statut, b.notes, req.params.id
  );
  if (b.lignes) {
    db.prepare('DELETE FROM facture_lignes WHERE facture_id = ?').run(req.params.id);
    const ins = db.prepare('INSERT INTO facture_lignes (facture_id,description,quantite,unite,prix_unitaire,total) VALUES (?,?,?,?,?,?)');
    b.lignes.forEach(l => ins.run(req.params.id, l.description, l.quantite||1, l.unite||'unité', l.prix_unitaire||0, (l.quantite||1)*(l.prix_unitaire||0)));
  }
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM factures WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

function genNum() {
  const d = new Date();
  return `FAC-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*900+100)}`;
}

module.exports = router;
