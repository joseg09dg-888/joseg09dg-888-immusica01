import { Router } from 'express';
import * as gamificationController from '../controllers/gamificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, gamificationController.getUserStats);
router.post('/xp', authenticate, gamificationController.addXP);
router.post('/achievement', authenticate, gamificationController.unlockAchievement);

export default router;
