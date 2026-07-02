const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// ===== Catalogue items =====

router.get('/', (req, res) => {
  const { company_id, type } = req.query;
  let sql = 'SELECT * FROM catalogue WHERE actif = 1';
  const params = [];
  if (company_id) { sql += ' AND company_id = ?'; params.push(company_id); }
  if (type) { sql += ' AND type = ?'; params.push(type); }
  sql += ' ORDER BY type, nom COLLATE NOCASE';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM catalogue WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item introuvable' });
  res.json(item);
});

router.post('/', (req, res) => {
  const { company_id, type, nom, description, unite, prix_unitaire } = req.body;
  if (!company_id || !type || !nom) return res.status(400).json({ error: 'company_id, type et nom requis' });
  const r = db.prepare(
    'INSERT INTO catalogue (company_id, type, nom, description, unite, prix_unitaire) VALUES (?,?,?,?,?,?)'
  ).run(company_id, type, nom, description || '', unite || 'unité', prix_unitaire || 0);
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { nom, description, unite, prix_unitaire, actif } = req.body;
  db.prepare(
    'UPDATE catalogue SET nom=?, description=?, unite=?, prix_unitaire=?, actif=? WHERE id=?'
  ).run(nom, description || '', unite || 'unité', prix_unitaire || 0, actif !== undefined ? actif : 1, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('UPDATE catalogue SET actif = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== Recette lignes =====

router.get('/:id/lignes', (req, res) => {
  const lignes = db.prepare(
    `SELECT rl.*, c.nom as catalogue_nom, c.type as catalogue_type
     FROM recette_lignes rl
     LEFT JOIN catalogue c ON rl.catalogue_id = c.id
     WHERE rl.recette_id = ?
     ORDER BY rl.ordre, rl.id`
  ).all(req.params.id);
  res.json(lignes);
});

router.post('/:id/lignes', (req, res) => {
  const { catalogue_id, description, quantite, unite, prix_unitaire } = req.body;
  const maxOrdre = db.prepare('SELECT COALESCE(MAX(ordre), 0) as m FROM recette_lignes WHERE recette_id = ?').get(req.params.id);
  const ordre = (maxOrdre?.m || 0) + 1;
  const r = db.prepare(
    'INSERT INTO recette_lignes (recette_id, catalogue_id, description, quantite, unite, prix_unitaire, ordre) VALUES (?,?,?,?,?,?,?)'
  ).run(req.params.id, catalogue_id || null, description || '', quantite || 1, unite || 'unité', prix_unitaire || 0, ordre);
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id/lignes/:lid', (req, res) => {
  const { description, quantite, unite, prix_unitaire } = req.body;
  db.prepare(
    'UPDATE recette_lignes SET description=?, quantite=?, unite=?, prix_unitaire=? WHERE id=? AND recette_id=?'
  ).run(description || '', quantite || 1, unite || 'unité', prix_unitaire || 0, req.params.lid, req.params.id);
  res.json({ success: true });
});

router.delete('/:id/lignes/:lid', (req, res) => {
  db.prepare('DELETE FROM recette_lignes WHERE id=? AND recette_id=?').run(req.params.lid, req.params.id);
  res.json({ success: true });
});

module.exports = router;
