import { Router } from 'express';
import * as recurringController from '../controllers/recurringController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', recurringController.getRecurringPatterns);
router.post('/', recurringController.createRecurringPattern);
router.put('/:id', recurringController.updateRecurringPattern);
router.delete('/:id', recurringController.deleteRecurringPattern);

export default router;
