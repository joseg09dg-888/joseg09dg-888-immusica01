import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../music_platform.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'artist',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    genre TEXT,
    bio TEXT,
    tier TEXT DEFAULT 'Basic',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    release_date TEXT,
    cover TEXT,
    audio_url TEXT,
    status TEXT DEFAULT 'draft',
    isrc TEXT,
    upc TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    budget REAL,
    platform TEXT,
    status TEXT DEFAULT 'active',
    start_date TEXT,
    end_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS royalties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER,
    fecha TEXT NOT NULL,
    plataforma TEXT NOT NULL,
    tipo TEXT,
    cantidad REAL NOT NULL,
    track_id INTEGER,
    concepto TEXT,
    estado TEXT DEFAULT 'proyectado',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE,
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    plataforma TEXT NOT NULL,
    streams INTEGER DEFAULT 0,
    ingresos REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(track_id, fecha, plataforma),
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    reference TEXT UNIQUE,
    amount REAL,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS splits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    artist_name TEXT NOT NULL,
    email TEXT NOT NULL,
    percentage REAL NOT NULL,
    role TEXT,
    status TEXT DEFAULT 'pending',
    invitation_token TEXT UNIQUE,
    accepted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS split_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    split_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(split_id) REFERENCES splits(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS royalty_withholdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    split_id INTEGER,
    cantidad REAL NOT NULL,
    estado TEXT DEFAULT 'withheld',
    released_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    FOREIGN KEY(split_id) REFERENCES splits(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS artist_branding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL UNIQUE,
    arquetipo TEXT,
    respuestas_test TEXT,
    manifiesto TEXT,
    colores TEXT,
    olores TEXT,
    sabores TEXT,
    texturas TEXT,
    lenguaje_tribu TEXT,
    simbolo TEXT,
    mercados_prioritarios TEXT,
    perfil_oyente TEXT,
    plan_contenidos TEXT,
    fecha_generacion_plan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );
`);

// Seed default users if not exists
import bcrypt from 'bcryptjs';

const seedUsers = [
  { email: 'admin@immusica.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { email: 'artist@immusic.com', password: 'password123', name: 'Elite Artist', role: 'artist' }
];

for (const u of seedUsers) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);
  if (!existing) {
    const hashedPw = bcrypt.hashSync(u.password, 10);
    const info = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(
      u.email,
      hashedPw,
      u.name,
      u.role
    );
    
    if (u.role === 'artist') {
      const userId = info.lastInsertRowid;
      const existingArtist = db.prepare('SELECT id FROM artists WHERE user_id = ?').get(userId);
      if (!existingArtist) {
        db.prepare('INSERT INTO artists (name, genre, bio, user_id, tier) VALUES (?, ?, ?, ?, ?)').run(
          'Neon Rebel',
          'Cyberpunk Pop',
          'Breaking the sound barrier since 2026.',
          userId,
          'Pro'
        );
      }
    }
  }
}

export default db;
