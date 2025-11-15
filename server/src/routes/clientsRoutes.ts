import { Router } from 'express';
import * as clientsController from '../controllers/clientsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', clientsController.getClients);
router.get('/:id', clientsController.getClient);
router.post('/', clientsController.createClient);
router.put('/:id', clientsController.updateClient);
router.delete('/:id', clientsController.deleteClient);

export default router;
