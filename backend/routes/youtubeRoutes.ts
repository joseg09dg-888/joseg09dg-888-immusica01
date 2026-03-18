import { Router } from 'express';
import * as youtubeController from '../controllers/youtubeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/artist-request', authenticate, youtubeController.requestArtistChannel);
router.post('/content-id/seo', authenticate, youtubeController.updateContentIdMetadata);
router.get('/analytics', authenticate, youtubeController.getYoutubeAnalytics);

export default router;
