import express from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  getMyTracks,
  createTrack,
  updateTrack,
  deleteTrack
} from '../controllers/trackController';

const router = express.Router();

router.use(authenticate);

router.get('/', getMyTracks);
router.post('/', upload.single('audio'), createTrack);
router.put('/:id', upload.single('audio'), updateTrack);
router.delete('/:id', deleteTrack);

export default router;
