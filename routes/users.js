const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT id, nom, email, role, actif, created_at FROM users ORDER BY nom').all());
});

router.post('/', requireAdmin, (req, res) => {
  const { nom, email, password, role } = req.body;
  if (!nom || !email || !password) return res.status(400).json({ error: 'Champs requis manquants' });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const r = db.prepare('INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)').run(nom, email.toLowerCase(), hash, role || 'employe');
    res.json({ id: r.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'Courriel déjà utilisé' });
  }
});

router.put('/:id', requireAdmin, (req, res) => {
  const { nom, email, role, actif, password } = req.body;
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET nom=?, email=?, role=?, actif=?, password=? WHERE id=?').run(nom, email, role, actif ? 1 : 0, hash, req.params.id);
  } else {
    db.prepare('UPDATE users SET nom=?, email=?, role=?, actif=? WHERE id=?').run(nom, email, role, actif ? 1 : 0, req.params.id);
  }
  res.json({ success: true });
});

router.put('/me/password', (req, res) => {
  const { ancien, nouveau } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (!bcrypt.compareSync(ancien, user.password)) return res.status(400).json({ error: 'Ancien mot de passe incorrect' });
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(nouveau, 10), req.session.userId);
  res.json({ success: true });
});

module.exports = router;
