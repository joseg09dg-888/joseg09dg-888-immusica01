import { Router } from 'express';
import * as publishingController from '../controllers/publishingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', authenticate, publishingController.registerComposition);
router.post('/blockchain-verify', authenticate, publishingController.verifyBlockchain);
router.get('/summary', authenticate, publishingController.getPublishingSummary);

export default router;
