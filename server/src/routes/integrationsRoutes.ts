import { Router } from 'express';
import * as integrationsController from '../controllers/integrationsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// OAuth routes (no auth required for callbacks)
router.get('/google/auth', authenticate, integrationsController.googleAuthUrl);
router.get('/google/callback', integrationsController.googleCallback);
router.post('/google/sync', authenticate, integrationsController.syncGoogleCalendar);

router.get('/microsoft/auth', authenticate, integrationsController.microsoftAuthUrl);
router.get('/microsoft/callback', integrationsController.microsoftCallback);
router.post('/microsoft/sync', authenticate, integrationsController.syncMicrosoftCalendar);

router.get('/zoom/auth', authenticate, integrationsController.zoomAuthUrl);
router.get('/zoom/callback', integrationsController.zoomCallback);

// Standard CRUD routes (authenticated)
router.use(authenticate);

router.get('/', integrationsController.getIntegrations);
router.post('/', integrationsController.createIntegration);
router.put('/:id', integrationsController.updateIntegration);
router.delete('/:id', integrationsController.deleteIntegration);

export default router;
