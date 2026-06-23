const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND actif = 1').get(email.toLowerCase().trim());
  if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Identifiants incorrects' });
  req.session.userId = user.id;
  req.session.nom = user.nom;
  req.session.email = user.email;
  req.session.role = user.role;
  res.json({ success: true, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Non connecté' });
  res.json({ id: req.session.userId, nom: req.session.nom, email: req.session.email, role: req.session.role });
});

module.exports = router;
