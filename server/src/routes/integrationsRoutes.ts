import { Router } from 'express';
import * as integrationsController from '../controllers/integrationsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', integrationsController.getIntegrations);
router.post('/', integrationsController.createIntegration);
router.put('/:id', integrationsController.updateIntegration);
router.delete('/:id', integrationsController.deleteIntegration);

export default router;
