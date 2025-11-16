import { Router } from 'express';
import * as paymentsController from '../controllers/paymentsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', paymentsController.getPayments);
router.post('/intent', paymentsController.createPaymentIntent);
router.post('/checkout', paymentsController.createCheckoutSession);
router.post('/refund', paymentsController.refundPayment);

export default router;
