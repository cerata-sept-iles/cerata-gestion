const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'cerata.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'employe',
      actif INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      description TEXT,
      tel TEXT,
      email TEXT,
      adresse TEXT
    );

    CREATE TABLE IF NOT EXISTS dossiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id TEXT NOT NULL,
      numero TEXT,
      nom TEXT NOT NULL,
      statut TEXT DEFAULT 'En cours',
      client TEXT,
      contact TEXT,
      tel TEXT,
      cell TEXT,
      fax TEXT,
      email TEXT,
      adresse_client TEXT,
      adresse_travaux TEXT,
      langue TEXT DEFAULT 'FranÃ§ais',
      type_travaux TEXT,
      categorie TEXT,
      representant TEXT,
      gestionnaire TEXT,
      priorite TEXT DEFAULT 'Normale',
      couleur TEXT,
      date_debut TEXT,
      date_fin TEXT,
      avancement INTEGER DEFAULT 0,
      budget REAL DEFAULT 0,
      description TEXT,
      notes TEXT,
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS soumissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id TEXT NOT NULL,
      dossier_id INTEGER,
      numero TEXT,
      titre TEXT NOT NULL,
      client TEXT,
      montant REAL DEFAULT 0,
      date_soumission TEXT,
      date_expiration TEXT,
      statut TEXT DEFAULT 'En attente',
      representant TEXT,
      type_travaux TEXT,
      description TEXT,
      notes TEXT,
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (dossier_id) REFERENCES dossiers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS bons_travail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id TEXT NOT NULL,
      dossier_id INTEGER,
      numero TEXT NOT NULL,
      date TEXT,
      client TEXT,
      description TEXT,
      operateur TEXT,
      equipement TEXT,
      heures REAL DEFAULT 0,
      taux_horaire REAL DEFAULT 0,
      cout_materiaux REAL DEFAULT 0,
      materiaux TEXT,
      statut TEXT DEFAULT 'Ouvert',
      notes TEXT,
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (dossier_id) REFERENCES dossiers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS rapports_service (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id TEXT NOT NULL,
      dossier_id INTEGER,
      numero TEXT,
      date TEXT,
      technicien TEXT,
      equipement TEXT,
      travaux TEXT,
      heures REAL DEFAULT 0,
      meteo TEXT,
      temperature TEXT,
      observations TEXT,
      statut TEXT DEFAULT 'Brouillon',
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (dossier_id) REFERENCES dossiers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS factures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id TEXT NOT NULL,
      dossier_id INTEGER,
      soumission_id INTEGER,
      numero TEXT,
      date TEXT,
      date_echeance TEXT,
      client TEXT,
      adresse_client TEXT,
      description TEXT,
      sous_total REAL DEFAULT 0,
      tps REAL DEFAULT 0,
      tvq REAL DEFAULT 0,
      total REAL DEFAULT 0,
      statut TEXT DEFAULT 'Brouillon',
      notes TEXT,
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (dossier_id) REFERENCES dossiers(id),
      FOREIGN KEY (soumission_id) REFERENCES soumissions(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS facture_lignes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facture_id INTEGER NOT NULL,
      description TEXT,
      quantite REAL DEFAULT 1,
      unite TEXT DEFAULT 'unitÃ©',
      prix_unitaire REAL DEFAULT 0,
      total REAL DEFAULT 0,
      FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id TEXT NOT NULL,
      nom TEXT NOT NULL,
      entreprise TEXT,
      type TEXT DEFAULT 'Client',
      tel TEXT,
      cell TEXT,
      email TEXT,
      adresse TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS feuilles_temps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id TEXT NOT NULL,
      dossier_id INTEGER,
      employe TEXT,
      date TEXT,
      heures REAL DEFAULT 0,
      taux REAL DEFAULT 0,
      description TEXT,
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (dossier_id) REFERENCES dossiers(id)
    );

    CREATE TABLE IF NOT EXISTS checklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dossier_id INTEGER NOT NULL,
      item TEXT NOT NULL,
      complete INTEGER DEFAULT 0,
      ordre INTEGER DEFAULT 0,
      FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes_dossier (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dossier_id INTEGER NOT NULL,
      contenu TEXT,
      auteur TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE
    );
  `);

  // Seed default companies
  const companies = [
    { id: 'cerata', nom: 'Cerata Sept-Ãles inc', description: 'Gestion gÃ©nÃ©rale' },
    { id: 'pompage', nom: 'Pompage bÃ©ton 7-Ãles', description: 'Pompage de bÃ©ton' },
    { id: 'coupage', nom: 'Coupage de bÃ©ton St-Pierre', description: 'DÃ©coupe et carottage' }
  ];
  const insertCo = db.prepare('INSERT OR IGNORE INTO companies (id, nom, description) VALUES (?, ?, ?)');
  companies.forEach(c => insertCo.run(c.id, c.nom, c.description));

  // Seed default admin user
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('info@cerata.ca');
  if (!existing) {
    const hash = bcrypt.hashSync('Cerata2024!', 10);
    db.prepare('INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)').run('StÃ©phanie Frattin', 'info@cerata.ca', hash, 'admin');
    console.log('â Compte admin crÃ©Ã©: info@cerata.ca / Cerata2024!');
  }
}

init();

// Migrations: add new columns if they don't exist yet
const migrations = [
  "ALTER TABLE soumissions ADD COLUMN type TEXT DEFAULT 'Résidentiel'",
  "ALTER TABLE soumissions ADD COLUMN numero_po TEXT",
  "ALTER TABLE bons_travail ADD COLUMN numero_po TEXT",
  "ALTER TABLE rapports_service ADD COLUMN numero_po TEXT",
  "ALTER TABLE factures ADD COLUMN numero_po TEXT",
];
migrations.forEach(sql => { try { db.exec(sql); } catch(e) { /* column already exists */ } });

module.exports = db;
