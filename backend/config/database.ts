import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../music_platform.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Existing tables...
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'artist',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    genre TEXT,
    bio TEXT,
    tier TEXT DEFAULT 'Basic',
    avatar TEXT,
    spotify_verified BOOLEAN DEFAULT 0,
    spotify_id TEXT,
    spotify_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id);

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
    auto_distribute BOOLEAN DEFAULT 0,
    leave_a_legacy BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
  CREATE INDEX IF NOT EXISTS idx_tracks_status ON tracks(status);

  CREATE TABLE IF NOT EXISTS vault_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_vault_artist_id ON vault_files(artist_id);

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
  CREATE INDEX IF NOT EXISTS idx_royalties_artist_id ON royalties(artist_id);
  CREATE INDEX IF NOT EXISTS idx_royalties_track_id ON royalties(track_id);

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
  CREATE INDEX IF NOT EXISTS idx_daily_stats_track_id ON daily_stats(track_id);

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

  CREATE TABLE IF NOT EXISTS inbox_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    sender TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    status TEXT DEFAULT 'unread',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_inbox_status ON inbox_messages(status);

  CREATE TABLE IF NOT EXISTS ia_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_ia_logs_action ON ia_logs(action);
  CREATE INDEX IF NOT EXISTS idx_ia_logs_status ON ia_logs(status);
  CREATE INDEX IF NOT EXISTS idx_daily_stats_fecha ON daily_stats(fecha);

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
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

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
  CREATE INDEX IF NOT EXISTS idx_splits_track_id ON splits(track_id);
  CREATE INDEX IF NOT EXISTS idx_splits_email ON splits(email);

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_moderated BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);

  CREATE TABLE IF NOT EXISTS riaa_certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- Gold, Platinum, Diamond
    threshold INTEGER NOT NULL,
    achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_riaa_artist_id ON riaa_certifications(artist_id);

  CREATE TABLE IF NOT EXISTS store_distributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    distributed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_store_track_id ON store_distributions(track_id);

  CREATE TABLE IF NOT EXISTS youtube_content_id (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    registration_id TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_youtube_track_id ON youtube_content_id(track_id);

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
  CREATE INDEX IF NOT EXISTS idx_campaigns_artist_id ON campaigns(artist_id);

  CREATE TABLE IF NOT EXISTS split_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    split_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(split_id) REFERENCES splits(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_split_inv_token ON split_invitations(token);

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
  CREATE INDEX IF NOT EXISTS idx_withholdings_track_id ON royalty_withholdings(track_id);

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

  CREATE TABLE IF NOT EXISTS lyrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    lyrics TEXT NOT NULL,
    type TEXT DEFAULT 'plain',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_lyrics_track_id ON lyrics(track_id);

  CREATE TABLE IF NOT EXISTS scheduled_releases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    release_date TEXT NOT NULL,
    platforms TEXT, -- JSON string
    status TEXT DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_scheduled_track_id ON scheduled_releases(track_id);

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    platform TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_videos_artist_id ON videos(artist_id);

  CREATE TABLE IF NOT EXISTS compositions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    iswc TEXT,
    pro TEXT,
    share REAL DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_compositions_artist_id ON compositions(artist_id);

  CREATE TABLE IF NOT EXISTS pitches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    playlist_id INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_pitches_track_id ON pitches(track_id);

  CREATE TABLE IF NOT EXISTS user_artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    artist_id INTEGER NOT NULL,
    role TEXT DEFAULT 'owner', -- owner, manager, collaborator
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_user_artists_user_id ON user_artists(user_id);

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

  CREATE TABLE IF NOT EXISTS composition_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    composition_id INTEGER NOT NULL,
    pro TEXT NOT NULL,
    registration_number TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(composition_id) REFERENCES compositions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS publishing_royalties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    composition_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    source TEXT,
    period TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(composition_id) REFERENCES compositions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS marketplace_beats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    genre TEXT,
    bpm INTEGER,
    price REAL NOT NULL,
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    status TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_beats_artist_id ON marketplace_beats(artist_id);

  CREATE TABLE IF NOT EXISTS beat_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beat_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(beat_id) REFERENCES marketplace_beats(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS legal_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    query TEXT NOT NULL,
    response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_strikes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reason TEXT,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT,
    genre TEXT,
    moods TEXT, -- JSON string
    contact_email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS legacy_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    track_id INTEGER, -- NULL if it's for the whole catalog
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS upload_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS upload_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES upload_jobs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS youtube_artist_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL,
    channel_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_yt_artist_req_artist_id ON youtube_artist_requests(artist_id);

  CREATE TABLE IF NOT EXISTS user_gamification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_gamification_user_id ON user_gamification(user_id);

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 0,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_user_ach_user_id ON user_achievements(user_id);

  CREATE TABLE IF NOT EXISTS blockchain_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, -- track, composition
    entity_id INTEGER NOT NULL,
    tx_hash TEXT NOT NULL,
    network TEXT DEFAULT 'Polygon',
    certificate_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_blockchain_entity ON blockchain_verifications(entity_type, entity_id);

  CREATE TABLE IF NOT EXISTS user_balances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    balance REAL DEFAULT 0,
    withheld REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_balances_user_id ON user_balances(user_id);

  CREATE TABLE IF NOT EXISTS royalty_distributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    royalty_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    split_id INTEGER,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, withheld
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(royalty_id) REFERENCES royalties(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(split_id) REFERENCES splits(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_distributions_user_id ON royalty_distributions(user_id);
  CREATE INDEX IF NOT EXISTS idx_distributions_royalty_id ON royalty_distributions(royalty_id);

  CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    method TEXT, -- paypal, bank, crypto
    status TEXT DEFAULT 'pending',
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);

  -- Additional Indices for Enterprise Base
  CREATE INDEX IF NOT EXISTS idx_tracks_isrc ON tracks(isrc);
  CREATE INDEX IF NOT EXISTS idx_tracks_upc ON tracks(upc);
  CREATE INDEX IF NOT EXISTS idx_royalties_fecha ON royalties(fecha);
  CREATE INDEX IF NOT EXISTS idx_royalties_plataforma ON royalties(plataforma);
  CREATE INDEX IF NOT EXISTS idx_royalties_estado ON royalties(estado);
  CREATE INDEX IF NOT EXISTS idx_daily_stats_fecha_plat ON daily_stats(fecha, plataforma);
  CREATE INDEX IF NOT EXISTS idx_splits_status ON splits(status);
  CREATE INDEX IF NOT EXISTS idx_compositions_iswc ON compositions(iswc);
  CREATE INDEX IF NOT EXISTS idx_marketplace_beats_genre ON marketplace_beats(genre);
  CREATE INDEX IF NOT EXISTS idx_marketplace_beats_status ON marketplace_beats(status);
  CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
  CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

  -- Views for optimized queries
  DROP VIEW IF EXISTS view_royalty_summary;
  CREATE VIEW view_royalty_summary AS
  SELECT 
    artist_id, 
    SUM(cantidad) as total_cantidad, 
    plataforma, 
    strftime('%Y-%m', fecha) as mes
  FROM royalties
  GROUP BY artist_id, plataforma, mes;

  DROP VIEW IF EXISTS view_publishing_summary;
  CREATE VIEW view_publishing_summary AS
  SELECT 
    c.artist_id, 
    c.title, 
    c.iswc, 
    SUM(pr.amount) as total_amount
  FROM compositions c
  LEFT JOIN publishing_royalties pr ON c.id = pr.composition_id
  GROUP BY c.id;
`);

// Seed default users if not exists
import bcrypt from 'bcryptjs';

const seedUsers = [
  { email: 'admin@immusica.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { email: 'joseg09.dg@gmail.com', password: 'admin123', name: 'Jose Admin', role: 'admin' },
  { email: 'artist@immusica.com', password: 'password123', name: 'Elite Artist', role: 'artist' }
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

// Marketplace enhancements
try { db.exec("ALTER TABLE marketplace_beats ADD COLUMN sales_count INTEGER DEFAULT 0;"); } catch(e) {}
try { db.exec("ALTER TABLE marketplace_beats ADD COLUMN rating_avg REAL DEFAULT 0;"); } catch(e) {}

// YouTube SEO
try { db.exec("ALTER TABLE youtube_content_id ADD COLUMN seo_metadata TEXT;"); } catch(e) {}

// IA Logs status
try { db.exec("ALTER TABLE ia_logs ADD COLUMN status TEXT DEFAULT 'pending';"); } catch(e) {}
try { db.exec("CREATE INDEX IF NOT EXISTS idx_ia_logs_status ON ia_logs(status);"); } catch(e) {}

export default db;
