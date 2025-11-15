import { Router } from 'express';
import * as demoController from '../controllers/demoController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/setup', demoController.setupDemoData);

export default router;
