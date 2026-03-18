import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { 
  getSummary, 
  uploadRoyalties, 
  getAllRoyalties, 
  processRoyalty, 
  getMyDistributions, 
  getMyBalance, 
  requestPayout 
} from '../controllers/royaltyController';

const router = express.Router();

router.use(authenticate);

router.get('/summary', getSummary);
router.post('/upload', uploadRoyalties);
router.get('/', getAllRoyalties);
router.post('/process', processRoyalty);

// Distribution & Balance
router.get('/distributions/my', getMyDistributions);
router.get('/balance/my', getMyBalance);
router.post('/payout/request', requestPayout);

export default router;
