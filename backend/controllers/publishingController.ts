import { Request, Response } from 'express';
import db from '../config/database';

export const registerComposition = (req: Request, res: Response) => {
  const { compositionId, pro } = req.body;
  
  if (!compositionId || !pro) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  
  // Simulate ISWC generation
  const iswc = `T-${Math.floor(Math.random() * 1000000000)}-${Math.floor(Math.random() * 9)}`;
  
  try {
    db.prepare(`
      UPDATE compositions 
      SET iswc = ?, pro = ? 
      WHERE id = ?
    `).run(iswc, pro, compositionId);
    
    // Log registration
    db.prepare(`
      INSERT INTO composition_registrations (composition_id, pro, status)
      VALUES (?, ?, 'registered')
    `).run(compositionId, pro);
    
    res.json({ success: true, iswc });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar composición' });
  }
};

export const verifyBlockchain = (req: Request, res: Response) => {
  const { entityType, entityId } = req.body;
  
  // Simulate blockchain transaction
  const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
  const certUrl = `https://cert.musicplatform.com/${txHash}`;
  
  try {
    db.prepare(`
      INSERT INTO blockchain_verifications (entity_type, entity_id, tx_hash, certificate_url)
      VALUES (?, ?, ?, ?)
    `).run(entityType, entityId, txHash, certUrl);
    
    res.json({ success: true, txHash, certUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar en blockchain' });
  }
};

export const getPublishingSummary = (req: Request, res: Response) => {
  const summary = db.prepare('SELECT * FROM view_publishing_summary').all();
  res.json(summary);
};
