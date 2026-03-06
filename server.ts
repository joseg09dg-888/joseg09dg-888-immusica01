import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import { GoogleGenAI } from "@google/genai";
import { parse } from "csv-parse/sync";
import bcrypt from "bcryptjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(process.env.DATABASE_URL || "music_platform.db");

// Gemini Configuration
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'im-music-uploads',
    allowed_formats: ['jpg', 'png', 'mp3', 'wav'],
  } as any,
});

const upload = multer({ storage: storage });

// Initialize Database with Security and Sample Data
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'artist'
  );

  CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    genre TEXT,
    bio TEXT,
    tier TEXT DEFAULT 'Basic',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER,
    title TEXT,
    release_date TEXT,
    status TEXT DEFAULT 'draft',
    isrc TEXT,
    upc TEXT,
    FOREIGN KEY(artist_id) REFERENCES artists(id)
  );

  CREATE TABLE IF NOT EXISTS royalties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT,
    plataforma TEXT,
    tipo TEXT,
    cantidad REAL,
    track_id INTEGER,
    concepto TEXT,
    estado TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(track_id) REFERENCES tracks(id)
  );

  CREATE TABLE IF NOT EXISTS branding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER,
    respuestas_test TEXT,
    arquetipo TEXT,
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
    FOREIGN KEY(artist_id) REFERENCES artists(id)
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER,
    name TEXT,
    budget REAL,
    status TEXT,
    platform TEXT,
    FOREIGN KEY(artist_id) REFERENCES artists(id)
  );
`);

// Seed Initial Data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("password123", 10);
  const info = db.prepare("INSERT INTO users (email, name, password) VALUES (?, ?, ?)").run("artist@immusic.com", "Elite Artist", hashedPassword);
  const userId = info.lastInsertRowid;
  
  const artistInfo = db.prepare("INSERT INTO artists (name, genre, bio, user_id, tier) VALUES (?, ?, ?, ?, ?)")
    .run("Neon Rebel", "Cyberpunk Pop", "Breaking the sound barrier since 2026.", userId, "Pro");
  const artistId = artistInfo.lastInsertRowid;

  const track1 = db.prepare("INSERT INTO tracks (artist_id, title, release_date, status, isrc) VALUES (?, ?, ?, ?, ?)")
    .run(artistId, "Digital Rebellion", "2026-01-15", "distributed", "QM-IM-26-00001");
  const track2 = db.prepare("INSERT INTO tracks (artist_id, title, release_date, status, isrc) VALUES (?, ?, ?, ?, ?)")
    .run(artistId, "Cyber Pulse", "2026-02-10", "distributed", "QM-IM-26-00002");

  db.prepare("INSERT INTO royalties (track_id, amount, period, platform) VALUES (?, ?, ?, ?)").run(track1.lastInsertRowid, 1250.45, "2026-01", "Spotify");
  db.prepare("INSERT INTO royalties (track_id, amount, period, platform) VALUES (?, ?, ?, ?)").run(track1.lastInsertRowid, 840.20, "2026-01", "Apple Music");
  db.prepare("INSERT INTO royalties (track_id, amount, period, platform) VALUES (?, ?, ?, ?)").run(track2.lastInsertRowid, 2100.00, "2026-02", "Spotify");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy is required when running behind a proxy (like in AI Studio)
  // to allow express-rate-limit to correctly identify user IPs.
  app.set('trust proxy', 1);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Vite handles this in dev
  }));
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for development
    message: { error: "Too many requests from this IP, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
  });
  app.use("/api", limiter);

  app.use(express.json());

  // JWT Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Request logging for debugging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const info = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, hashedPassword, name);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
    
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (err) {
      // Fallback for plain text passwords or invalid hashes
      isMatch = user.password === password;
    }
    
    if (isMatch || user.password === password) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/me", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  app.post("/api/upload", authenticateToken, upload.single('file'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: req.file.path, public_id: req.file.filename });
  });

  app.get("/api/artists", (req, res) => {
    const artists = db.prepare("SELECT * FROM artists").all();
    res.json(artists);
  });

  app.post("/api/artists", (req, res) => {
    const { name, genre, bio, user_id } = req.body;
    if (!name || !genre || !user_id) return res.status(400).json({ error: "Missing fields" });
    const info = db.prepare("INSERT INTO artists (name, genre, bio, user_id) VALUES (?, ?, ?, ?)").run(name, genre, bio, user_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/tracks", (req, res) => {
    const tracks = db.prepare("SELECT * FROM tracks ORDER BY id DESC").all();
    res.json(tracks);
  });

  app.post("/api/tracks", (req, res) => {
    const { artist_id, title, release_date } = req.body;
    if (!artist_id || !title || !release_date) return res.status(400).json({ error: "Missing fields" });
    const info = db.prepare("INSERT INTO tracks (artist_id, title, release_date) VALUES (?, ?, ?)").run(artist_id, title, release_date);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/royalties/summary", authenticateToken, (req: any, res) => {
    // For demo, we'll assume the user is associated with an artist
    const artist = db.prepare("SELECT id FROM artists WHERE user_id = ?").get(req.user.id) as any;
    if (!artist) return res.json({ total: 0, byPlatform: [] });

    const summary = db.prepare("SELECT SUM(cantidad) as total FROM royalties WHERE track_id IN (SELECT id FROM tracks WHERE artist_id = ?)").get(artist.id) as any;
    const byPlatform = db.prepare("SELECT plataforma as platform, SUM(cantidad) as total FROM royalties WHERE track_id IN (SELECT id FROM tracks WHERE artist_id = ?) GROUP BY plataforma").all(artist.id);
    res.json({ total: summary.total || 0, byPlatform });
  });

  app.get("/api/royalties", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'artist') return res.sendStatus(403);
    const royalties = db.prepare("SELECT * FROM royalties ORDER BY fecha DESC").all();
    res.json(royalties);
  });

  app.post("/api/royalties/upload", authenticateToken, upload.single('file'), (req: any, res) => {
    // In a real app, we'd parse the CSV file from req.file.path or buffer
    // For this environment, we'll accept a raw CSV string in the body if no file
    const csvData = req.body.csv || "";
    if (!csvData) return res.status(400).json({ error: "No CSV data provided" });

    try {
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true
      });

      const insert = db.prepare("INSERT INTO royalties (fecha, plataforma, tipo, cantidad, track_id, concepto, estado) VALUES (?, ?, ?, ?, ?, ?, ?)");
      const transaction = db.transaction((data) => {
        for (const row of data) {
          insert.run(row.fecha, row.plataforma, row.tipo, parseFloat(row.cantidad), row.track_id || null, row.concepto, row.estado);
        }
      });
      transaction(records);

      res.json({ message: `Successfully imported ${records.length} records` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Marketing Routes
  app.get("/api/marketing/preguntas", (req, res) => {
    const preguntas = [
      "¿Cómo describirías tu música en una sola palabra?",
      "¿Qué emoción quieres que sienta alguien al escucharte por primera vez?",
      "¿Cuál es tu mayor miedo como artista?",
      "¿A quién quieres representar con tu arte?",
      "¿Qué es lo más valiente que has hecho en tu carrera?",
      "¿Si tu música fuera un lugar, cómo sería?",
      "¿Qué mensaje le darías a tu 'yo' de hace 10 años?",
      "¿Qué te hace diferente a cualquier otro artista de tu género?",
      "¿Cuál es tu ritual antes de subir al escenario o entrar al estudio?",
      "¿Qué legado quieres dejar en el mundo?",
      "¿Cómo manejas las críticas negativas?",
      "¿Qué significa para ti el éxito?"
    ];
    res.json(preguntas);
  });

  app.post("/api/marketing/test", authenticateToken, async (req: any, res) => {
    const { respuestas } = req.body;
    const artist = db.prepare("SELECT id FROM artists WHERE user_id = ?").get(req.user.id) as any;
    if (!artist) return res.status(404).json({ error: "Artist profile not found" });

    const prompt = `Analiza las siguientes 12 respuestas de un artista a un test de personalidad y determina su arquetipo (pueden ser híbridos como Héroe+Creador) y genera un manifiesto poderoso de 3 párrafos.
    Respuestas: ${JSON.stringify(respuestas)}
    
    Responde ÚNICAMENTE en formato JSON con las llaves: "arquetipo" y "manifiesto".`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      
      // Save or update branding
      const existing = db.prepare("SELECT id FROM branding WHERE artist_id = ?").get(artist.id);
      if (existing) {
        db.prepare("UPDATE branding SET respuestas_test = ?, arquetipo = ?, manifiesto = ?, updated_at = CURRENT_TIMESTAMP WHERE artist_id = ?")
          .run(JSON.stringify(respuestas), result.arquetipo, result.manifiesto, artist.id);
      } else {
        db.prepare("INSERT INTO branding (artist_id, respuestas_test, arquetipo, manifiesto) VALUES (?, ?, ?, ?)")
          .run(artist.id, JSON.stringify(respuestas), result.arquetipo, result.manifiesto);
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/marketing/generar-branding", authenticateToken, async (req: any, res) => {
    const artist = db.prepare("SELECT id, arquetipo FROM branding WHERE artist_id = (SELECT id FROM artists WHERE user_id = ?)").get(req.user.id) as any;
    if (!artist || !artist.arquetipo) return res.status(400).json({ error: "Debes completar el test primero" });

    const prompt = `Basado en el arquetipo "${artist.arquetipo}", genera una identidad sensorial detallada para el artista.
    Incluye:
    - Colores (con códigos HEX y nombres descriptivos)
    - Olores (que evoquen su esencia)
    - Sabores (que representen su vibra)
    - Texturas (materiales que definan su estética)
    - Lenguaje de la tribu (frases, gestos o palabras clave)
    - Símbolo (descripción de un símbolo icónico)
    
    Responde ÚNICAMENTE en formato JSON con las llaves: "colores", "olores", "sabores", "texturas", "lenguaje_tribu", "simbolo".`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      
      db.prepare("UPDATE branding SET colores = ?, olores = ?, sabores = ?, texturas = ?, lenguaje_tribu = ?, simbolo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(result.colores, result.olores, result.sabores, result.texturas, result.lenguaje_tribu, result.simbolo, artist.id);

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/marketing/generar-mercado", authenticateToken, async (req: any, res) => {
    const artist = db.prepare("SELECT id, arquetipo FROM branding WHERE artist_id = (SELECT id FROM artists WHERE user_id = ?)").get(req.user.id) as any;
    if (!artist) return res.status(400).json({ error: "Branding no encontrado" });

    const prompt = `Basado en un artista con arquetipo "${artist.arquetipo}", identifica los 4 mercados (ciudades/países) prioritarios y genera un perfil detallado del oyente ideal (edad, intereses, estilo de vida).
    
    Responde ÚNICAMENTE en formato JSON con las llaves: "mercados_prioritarios" (array de strings) y "perfil_oyente" (string).`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      
      db.prepare("UPDATE branding SET mercados_prioritarios = ?, perfil_oyente = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(JSON.stringify(result.mercados_prioritarios), result.perfil_oyente, artist.id);

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/marketing/generar-plan", authenticateToken, async (req: any, res) => {
    const artist = db.prepare("SELECT id, arquetipo, manifiesto FROM branding WHERE artist_id = (SELECT id FROM artists WHERE user_id = ?)").get(req.user.id) as any;
    if (!artist) return res.status(400).json({ error: "Branding no encontrado" });

    const prompt = `Genera un plan de contenidos de marketing de 30 días para un artista con arquetipo "${artist.arquetipo}".
    Divide el plan en 4 fases:
    1. Demolición y misterio (Días 1-7)
    2. Conexión y storytelling (Días 8-15)
    3. Validación del mercado (Días 16-23)
    4. Conversión y ascensión (Días 24-30)
    
    Para cada fase, proporciona un resumen de la estrategia y ejemplos de tipos de contenido.
    
    Responde ÚNICAMENTE en formato JSON con la llave "plan_contenidos" que contenga un objeto con las 4 fases.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      
      db.prepare("UPDATE branding SET plan_contenidos = ?, fecha_generacion_plan = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(JSON.stringify(result.plan_contenidos), new Date().toISOString(), artist.id);

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/marketing/mi-branding", authenticateToken, (req: any, res) => {
    const branding = db.prepare("SELECT * FROM branding WHERE artist_id = (SELECT id FROM artists WHERE user_id = ?)").get(req.user.id);
    if (!branding) return res.status(404).json({ error: "No branding found" });
    res.json(branding);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IM MUSIC Server running on http://localhost:${PORT}`);
  });
}

startServer();
