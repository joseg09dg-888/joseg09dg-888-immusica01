import { Request, Response } from 'express';
import db from '../config/database';
import { cache } from '../utils/cache';

export const getBeats = (req: Request, res: Response) => {
  const { genre, minPrice, maxPrice, sortBy } = req.query;
  
  let query = `
    SELECT b.*, a.name as producer 
    FROM marketplace_beats b
    JOIN artists a ON b.artist_id = a.id
    WHERE b.status = 'available'
  `;
  const params: any[] = [];
  
  if (genre) {
    query += ' AND genre = ?';
    params.push(genre);
  }
  
  if (minPrice) {
    query += ' AND price >= ?';
    params.push(minPrice);
  }
  
  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(maxPrice);
  }
  
  if (sortBy === 'hot') {
    query += ' ORDER BY sales_count DESC';
  } else if (sortBy === 'price_asc') {
    query += ' ORDER BY price ASC';
  } else if (sortBy === 'price_desc') {
    query += ' ORDER BY price DESC';
  } else {
    query += ' ORDER BY created_at DESC';
  }
  
  const beats = db.prepare(query).all(...params);
  
  // Dynamic Pricing Simulation
  const enhancedBeats = (beats as any[]).map(beat => {
    let dynamicPrice = beat.price;
    if (beat.sales_count > 50) dynamicPrice *= 1.2; // 20% increase for high demand
    if (beat.sales_count > 100) dynamicPrice *= 1.5; // 50% increase for very high demand
    return { ...beat, dynamicPrice: Math.round(dynamicPrice) };
  });
  
  res.json(enhancedBeats);
};

export const getHotRanking = (req: Request, res: Response) => {
  const cached = cache.get('hot_ranking');
  if (cached) return res.json(cached);
  
  const ranking = db.prepare(`
    SELECT * FROM marketplace_beats 
    WHERE status = 'available' 
    ORDER BY sales_count DESC 
    LIMIT 10
  `).all();
  
  cache.set('hot_ranking', ranking, 300); // 5 min cache
  res.json(ranking);
};

export const getTopProducers = (req: Request, res: Response) => {
  const cached = cache.get('top_producers');
  if (cached) return res.json(cached);
  
  const producers = db.prepare(`
    SELECT a.name, a.avatar, SUM(b.sales_count) as total_sales, COUNT(b.id) as total_beats
    FROM artists a
    JOIN marketplace_beats b ON a.id = b.artist_id
    GROUP BY a.id
    ORDER BY total_sales DESC
    LIMIT 10
  `).all();
  
  cache.set('top_producers', producers, 600); // 10 min cache
  res.json(producers);
};

export const buyBeat = (req: Request, res: Response) => {
  const { beatId } = req.body;
  const userId = (req as any).user.id;
  
  const beat = db.prepare('SELECT * FROM marketplace_beats WHERE id = ?').get(beatId) as any;
  if (!beat) return res.status(404).json({ error: 'Beat no encontrado' });
  
  // In a real system, process payment here
  
  db.prepare('UPDATE marketplace_beats SET sales_count = sales_count + 1 WHERE id = ?').run(beatId);
  
  // Clear caches
  cache.delete('hot_ranking');
  cache.delete('top_producers');
  
  res.json({ success: true, message: `Has comprado "${beat.title}"`, beat });
};
