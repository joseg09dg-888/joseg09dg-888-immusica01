import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as ArtistModel from '../models/Artist';
import * as TrackModel from '../models/Track';
import * as RoyaltyModel from '../models/Royalty';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import db from '../config/database';

const upload = multer({ dest: 'uploads/' });

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'No autorizado' });
    
    let artistId: number | undefined;
    if (req.user.role !== 'admin') {
      const artists = ArtistModel.getArtistsByUser(req.user.id);
      if (artists.length === 0) return res.json({ total: 0, byPlatform: {}, byMonth: {} });
      artistId = artists[0].id;
    }
    
    const summary = RoyaltyModel.getSummary(artistId);
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};

export const uploadRoyalties = [
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'No autorizado' });

      let records: any[] = [];

      if (req.file) {
        const fs = await import('fs');
        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        records = parse(fileContent, { columns: true, skip_empty_lines: true });
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } else if (req.body.csv) {
        records = parse(req.body.csv, { columns: true, skip_empty_lines: true });
      } else {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo o datos CSV' });
      }

      const artists = ArtistModel.getArtistsByUser(req.user.id);
      const artistId = artists.length > 0 ? artists[0].id : null;

      for (const row of records) {
        if (!row.fecha || !row.plataforma || !row.cantidad) {
          console.warn('Fila incompleta, se omite:', row);
          continue;
        }

        let trackId = null;
        if (row.track_id) {
          trackId = parseInt(row.track_id);
        } else if (row.track_title) {
          const tracks = TrackModel.getAllTracks().filter((t: any) => t.title === row.track_title);
          if (tracks.length > 0) trackId = tracks[0].id;
        }

        const info = RoyaltyModel.createRoyalty({
          artist_id: artistId,
          fecha: row.fecha,
          plataforma: row.plataforma,
          tipo: row.tipo || null,
          cantidad: parseFloat(row.cantidad),
          track_id: trackId,
          concepto: row.concepto || null,
          estado: row.estado || 'proyectado'
        });

        // Trigger withholding if track has splits
        if (trackId) {
          processSplitsForRoyalty(trackId, parseFloat(row.cantidad), info.lastInsertRowid as number);
        }
      }

      res.json({ message: 'Datos procesados correctamente', filas: records.length });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Error al procesar los datos: ' + error.message });
    }
  }
];

export const getAllRoyalties = (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'No autorizado' });

  if (req.user.role === 'admin') {
    const royalties = RoyaltyModel.getAllRoyalties();
    return res.json(royalties);
  }

  const artists = ArtistModel.getArtistsByUser(req.user.id);
  if (artists.length === 0) return res.json([]);
  
  const royalties = RoyaltyModel.getRoyaltiesByArtist(artists[0].id);
  res.json(royalties);
};

export const processRoyalty = async (req: AuthRequest, res: Response) => {
  const { track_id, cantidad, plataforma, fecha } = req.body;
  try {
    const track = db.prepare('SELECT artist_id FROM tracks WHERE id = ?').get(track_id) as any;
    if (!track) return res.status(404).json({ error: 'Track not found' });

    const info = RoyaltyModel.createRoyalty({
      artist_id: track.artist_id,
      fecha,
      plataforma,
      cantidad,
      track_id,
      estado: 'pagado',
      tipo: 'manual',
      concepto: 'Procesado manualmente'
    });

    processSplitsForRoyalty(track_id, cantidad, info.lastInsertRowid as number);
    res.json({ message: 'Royalty processed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const processSplitsForRoyalty = (trackId: number, amount: number, royaltyId: number) => {
  const splits = db.prepare('SELECT * FROM splits WHERE track_id = ? AND status = "accepted"').all(trackId) as any[];
  
  // Get track owner
  const track = db.prepare('SELECT artist_id FROM tracks WHERE id = ?').get(trackId) as any;
  const owner = db.prepare('SELECT user_id FROM artists WHERE id = ?').get(track.artist_id) as any;
  
  let totalSplitPercentage = 0;
  
  for (const split of splits) {
    totalSplitPercentage += split.percentage;
    const shareAmount = (amount * split.percentage) / 100;
    
    // Find user by email
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(split.email) as any;
    
    if (user) {
      // Record distribution
      db.prepare(`
        INSERT INTO royalty_distributions (royalty_id, user_id, split_id, amount, status)
        VALUES (?, ?, ?, ?, 'paid')
      `).run(royaltyId, user.id, split.id, shareAmount);
      
      // Update balance
      db.prepare(`
        INSERT INTO user_balances (user_id, balance) 
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP
      `).run(user.id, shareAmount, shareAmount);
    } else {
      // User not found, withhold funds
      db.prepare(`
        INSERT INTO royalty_distributions (royalty_id, user_id, split_id, amount, status)
        VALUES (?, ?, ?, ?, 'withheld')
      `).run(royaltyId, 0, split.id, shareAmount); // 0 for unknown user
      
      db.prepare(`
        INSERT INTO royalty_withholdings (track_id, split_id, cantidad, estado)
        VALUES (?, ?, ?, 'withheld')
      `).run(trackId, split.id, shareAmount, 'withheld');
    }
  }
  
  // Remaining goes to owner
  const ownerPercentage = 100 - totalSplitPercentage;
  if (ownerPercentage > 0) {
    const ownerAmount = (amount * ownerPercentage) / 100;
    
    db.prepare(`
      INSERT INTO royalty_distributions (royalty_id, user_id, amount, status)
      VALUES (?, ?, ?, 'paid')
    `).run(royaltyId, owner.user_id, ownerAmount);
    
    db.prepare(`
      INSERT INTO user_balances (user_id, balance) 
      VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP
    `).run(owner.user_id, ownerAmount, ownerAmount);
  }
};

export const getMyDistributions = (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'No autorizado' });
  try {
    const distributions = db.prepare(`
      SELECT rd.*, r.fecha, r.plataforma, t.title as track_title
      FROM royalty_distributions rd
      JOIN royalties r ON rd.royalty_id = r.id
      LEFT JOIN tracks t ON r.track_id = t.id
      WHERE rd.user_id = ?
      ORDER BY r.fecha DESC
    `).all(req.user.id);
    res.json(distributions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyBalance = (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'No autorizado' });
  try {
    const balance = db.prepare('SELECT * FROM user_balances WHERE user_id = ?').get(req.user.id);
    res.json(balance || { balance: 0, withheld: 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const requestPayout = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'No autorizado' });
  const { amount, method } = req.body;
  
  try {
    const balance = db.prepare('SELECT balance FROM user_balances WHERE user_id = ?').get(req.user.id) as any;
    if (!balance || balance.balance < amount) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }
    
    db.transaction(() => {
      db.prepare('UPDATE user_balances SET balance = balance - ? WHERE user_id = ?').run(amount, req.user!.id);
      db.prepare('INSERT INTO payouts (user_id, amount, method) VALUES (?, ?, ?)').run(req.user!.id, amount, method);
    })();
    
    res.json({ message: 'Payout requested successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
