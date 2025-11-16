import { Router } from 'express';
import * as credentialsController from '../controllers/integrationCredentialsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Save credentials
router.post('/whatsapp', credentialsController.saveWhatsAppCredentials);
router.post('/twilio', credentialsController.saveTwilioCredentials);
router.post('/stripe', credentialsController.saveStripeCredentials);
router.post('/email', credentialsController.saveEmailCredentials);

// Get credentials (masked)
router.get('/:provider', credentialsController.getIntegrationCredentials);

// Test connections
router.post('/whatsapp/test', credentialsController.testWhatsAppConnection);
router.post('/twilio/test', credentialsController.testTwilioConnection);
router.post('/stripe/test', credentialsController.testStripeConnection);
router.post('/email/test', credentialsController.testEmailConnection);

export default router;
