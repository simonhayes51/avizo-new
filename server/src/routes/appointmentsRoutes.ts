import { Router } from 'express';
import * as appointmentsController from '../controllers/appointmentsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', appointmentsController.getAppointments);
router.get('/:id', appointmentsController.getAppointment);
router.post('/', appointmentsController.createAppointment);
router.put('/:id', appointmentsController.updateAppointment);
router.delete('/:id', appointmentsController.deleteAppointment);

export default router;
