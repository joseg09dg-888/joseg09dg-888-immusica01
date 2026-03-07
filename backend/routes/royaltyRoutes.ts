import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getSummary, uploadRoyalties, getAllRoyalties } from '../controllers/royaltyController';

const router = express.Router();

router.use(authenticate);

router.get('/summary', getSummary);
router.post('/upload', uploadRoyalties);
router.get('/', getAllRoyalties);

export default router;
