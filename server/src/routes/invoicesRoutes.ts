import { Router } from 'express';
import * as invoicesController from '../controllers/invoicesController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', invoicesController.getInvoices);
router.post('/', invoicesController.createInvoice);
router.put('/:id', invoicesController.updateInvoice);
router.delete('/:id', invoicesController.deleteInvoice);

export default router;
