import { Router } from 'express';
import * as reviewsController from '../controllers/reviewsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Review Platforms
router.get('/platforms', reviewsController.getPlatforms);
router.post('/platforms', reviewsController.addPlatform);
router.put('/platforms/:id', reviewsController.updatePlatform);
router.delete('/platforms/:id', reviewsController.deletePlatform);

// Analytics (must come before /:id routes)
router.get('/analytics/stats', reviewsController.getReviewStats);
router.get('/analytics/trends', reviewsController.getReviewTrends);

// Utility
router.post('/sync', reviewsController.syncReviews);
router.post('/generate-samples', reviewsController.generateSampleReviews);

// Reviews (generic routes last)
router.get('/', reviewsController.getReviews);
router.get('/:id', reviewsController.getReview);
router.post('/', reviewsController.addReview);
router.put('/:id', reviewsController.updateReview);
router.delete('/:id', reviewsController.deleteReview);

export default router;
