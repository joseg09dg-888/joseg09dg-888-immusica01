import { Request, Response } from 'express';
import db from '../config/database';
import os from 'os';

export const getInboxMessages = (req: Request, res: Response) => {
  const { status, limit } = req.query;
  const queryLimit = parseInt(limit as string) || 50;
  
  let query = 'SELECT * FROM inbox_messages';
  const params: any[] = [];
  
  if (status && status !== 'all') {
    query += ' WHERE status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(queryLimit);
  
  const messages = db.prepare(query).all(...params);
  res.json(messages);
};

export const processInboxMessage = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.prepare('UPDATE inbox_messages SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true });
};

export const getSystemLogs = (req: Request, res: Response) => {
  const { lines } = req.query;
  const queryLimit = parseInt(lines as string) || 100;
  
  const logs = db.prepare('SELECT * FROM ia_logs ORDER BY created_at DESC LIMIT ?').all(queryLimit);
  res.json({ actionLogs: logs });
};

export const getResourceStatus = (req: Request, res: Response) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  const cpus = os.cpus();
  const load = os.loadavg()[0]; // 1 minute load average
  
  res.json({
    cpu: {
      load: Math.round((load / cpus.length) * 100),
      cores: cpus.length
    },
    memory: {
      used: Math.round(usedMem / (1024 * 1024)),
      total: Math.round(totalMem / (1024 * 1024))
    },
    disk: {
      percent: 45 // Simulated
    },
    uptime: `${Math.round(os.uptime())}s`,
    db: {
      tables: 25,
      size: '1.2MB'
    }
  });
};

export const getAiConfig = (req: Request, res: Response) => {
  res.json({
    model: 'gemini-3-flash-preview',
    temperature: 0.7,
    maxTokens: 2048,
    emergencyStop: false
  });
};

export const setEmergencyStop = (req: Request, res: Response) => {
  const { stop } = req.body;
  // In a real app, this would set a global flag or update a config file
  res.json({ success: true, emergencyStop: stop });
};

export const getPendingTasks = (req: Request, res: Response) => {
  res.json([]);
};

export const updateTask = (req: Request, res: Response) => {
  res.json({ success: true });
};

export const sendNotification = (req: Request, res: Response) => {
  res.json({ success: true });
};

export const createGitHubBranch = (req: Request, res: Response) => {
  res.json({ success: true });
};

export const testNgrok = (req: Request, res: Response) => {
  res.json({ success: true, url: 'https://test.ngrok.io' });
};
