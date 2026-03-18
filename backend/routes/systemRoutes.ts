import express from 'express';
import { getSystemInfo, pitchToPlaylist, getMyPitches, getAuditLogs } from '../controllers/systemController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = express.Router();

router.get('/info', authenticate, getSystemInfo);
router.post('/pitch', authenticate, pitchToPlaylist);
router.get('/pitches', authenticate, getMyPitches);
router.get('/audit-logs', authenticate, authorize(['admin', 'ai_operator']), getAuditLogs);

export default router;
