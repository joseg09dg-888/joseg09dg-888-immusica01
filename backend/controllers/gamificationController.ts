import { Request, Response } from 'express';
import db from '../config/database';
import { appEvents, EVENTS } from '../utils/events';

export const getUserStats = (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const stats = db.prepare('SELECT * FROM user_gamification WHERE user_id = ?').get(userId);
  const achievements = db.prepare(`
    SELECT a.*, ua.achieved_at 
    FROM achievements a
    JOIN user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = ?
  `).all(userId);
  
  res.json({ stats, achievements });
};

export const addXP = (req: Request, res: Response) => {
  const { userId, amount, reason } = req.body;
  
  try {
    const current = db.prepare('SELECT xp, level FROM user_gamification WHERE user_id = ?').get(userId) as any;
    if (!current) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const newXP = current.xp + amount;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    
    db.prepare('UPDATE user_gamification SET xp = ?, level = ? WHERE user_id = ?').run(newXP, newLevel, userId);
    
    appEvents.emit(EVENTS.XP_GAINED, { userId, amount, reason, newLevel });
    
    res.json({ success: true, newXP, newLevel });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar XP' });
  }
};

export const unlockAchievement = (req: Request, res: Response) => {
  const { userId, achievementId } = req.body;
  
  try {
    db.prepare('INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(userId, achievementId);
    
    const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId) as any;
    
    appEvents.emit(EVENTS.ACHIEVEMENT_UNLOCKED, { userId, achievement });
    
    res.json({ success: true, achievement });
  } catch (error) {
    res.status(500).json({ error: 'Error al desbloquear logro' });
  }
};
