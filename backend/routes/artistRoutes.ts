import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getMyArtists,
  getArtist,
  createArtist,
  updateArtist,
  deleteArtist
} from '../controllers/artistController';

const router = express.Router();

router.use(authenticate);

router.get('/', getMyArtists);
router.get('/:id', getArtist);
router.post('/', createArtist);
router.put('/:id', updateArtist);
router.delete('/:id', authorize('admin'), deleteArtist);

export default router;
