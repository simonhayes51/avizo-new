import { Router } from 'express';
import * as conversationsController from '../controllers/conversationsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', conversationsController.getConversations);
router.get('/:id', conversationsController.getConversation);
router.post('/', conversationsController.createConversation);
router.get('/:conversationId/messages', conversationsController.getMessages);
router.post('/:conversationId/messages', conversationsController.sendMessage);

export default router;
