import { Request, Response } from 'express';
import db from '../config/database';

export const requestArtistChannel = (req: Request, res: Response) => {
  const { artistId, channelUrl } = req.body;
  
  if (!artistId || !channelUrl) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  
  try {
    const result = db.prepare(`
      INSERT INTO youtube_artist_requests (artist_id, channel_url)
      VALUES (?, ?)
    `).run(artistId, channelUrl);
    
    res.json({ success: true, requestId: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

export const updateContentIdMetadata = (req: Request, res: Response) => {
  const { contentId, seoMetadata } = req.body;
  
  try {
    db.prepare(`
      UPDATE youtube_content_id 
      SET seo_metadata = ? 
      WHERE id = ?
    `).run(JSON.stringify(seoMetadata), contentId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar metadata' });
  }
};

export const getYoutubeAnalytics = (req: Request, res: Response) => {
  // En un sistema real, esto llamaría a la API de YouTube
  res.json({
    views: 1250000,
    revenue: 4500.25,
    topRegions: ['US', 'MX', 'CO', 'ES'],
    monetizationStatus: 'Active'
  });
};
