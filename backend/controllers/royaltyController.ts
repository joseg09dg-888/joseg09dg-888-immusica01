import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as ArtistModel from '../models/Artist';
import * as TrackModel from '../models/Track';
import * as RoyaltyModel from '../models/Royalty';
import multer from 'multer';
import { parse } from 'csv-parse/sync';

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

        RoyaltyModel.createRoyalty({
          artist_id: artistId,
          fecha: row.fecha,
          plataforma: row.plataforma,
          tipo: row.tipo || null,
          cantidad: parseFloat(row.cantidad),
          track_id: trackId,
          concepto: row.concepto || null,
          estado: row.estado || 'proyectado'
        });
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
