import { Router } from 'express';
import * as waitingListController from '../controllers/waitingListController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', waitingListController.getWaitingList);
router.post('/', waitingListController.addToWaitingList);
router.put('/:id', waitingListController.updateWaitingListEntry);
router.delete('/:id', waitingListController.deleteWaitingListEntry);

export default router;
