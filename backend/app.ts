import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from "vite";

import authRoutes from './routes/authRoutes';
import artistRoutes from './routes/artistRoutes';
import royaltyRoutes from './routes/royaltyRoutes';
import marketingRoutes from './routes/marketingRoutes';
import facebookAdsRoutes from './routes/facebookAdsRoutes';
import trackRoutes from './routes/trackRoutes';
import legalRoutes from './routes/legalRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes';
import financingRoutes from './routes/financingRoutes';
import bulkUploadRoutes from './routes/bulkUploadRoutes';
import moodRoutes from './routes/moodRoutes';
import wompiRoutes from './routes/wompiRoutes';
import splitRoutes from './routes/splitRoutes';
import statsRoutes from './routes/statsRoutes';
import { upload } from './middleware/upload';
import { authenticate } from './middleware/auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: 'Demasiadas peticiones, intenta más tarde' }
  });
  app.use('/api', limiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/artists', artistRoutes);
  app.use('/api/royalties', royaltyRoutes);
  app.use('/api/marketing', marketingRoutes);
  app.use('/api/facebook-ads', facebookAdsRoutes);
  app.use('/api/tracks', trackRoutes);
  app.use('/api/legal-agent', legalRoutes);
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/financing', financingRoutes);
  app.use('/api/upload', bulkUploadRoutes);
  app.use('/api/mood', moodRoutes);
  app.use('/api/wompi', wompiRoutes);
  app.use('/api/splits', splitRoutes);
  app.use('/api/stats', statsRoutes);

  app.post('/api/upload', authenticate, upload.single('file'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: req.file.path, public_id: req.file.filename });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "../dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../dist", "index.html"));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();
