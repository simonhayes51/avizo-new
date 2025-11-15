import { Router } from 'express';
import * as automationsController from '../controllers/automationsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', automationsController.getAutomations);
router.get('/:id', automationsController.getAutomation);
router.post('/', automationsController.createAutomation);
router.put('/:id', automationsController.updateAutomation);
router.delete('/:id', automationsController.deleteAutomation);
router.get('/:id/logs', automationsController.getAutomationLogs);

export default router;
