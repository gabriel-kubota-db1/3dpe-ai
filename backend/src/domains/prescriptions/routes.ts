import { Router } from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { prescriptionSchema } from './validators';
import { createPrescription, getAllPrescriptions, getPrescriptionById, updatePrescription } from './controller';
import { isAuthenticated } from '../../middlewares/isAuthenticated';

const router = Router();

router.get('/', isAuthenticated, getAllPrescriptions);
router.get('/:id', isAuthenticated, getPrescriptionById);
router.post('/', isAuthenticated, validateRequest({ body: prescriptionSchema }), createPrescription);
router.put('/:id', isAuthenticated, validateRequest({ body: prescriptionSchema }), updatePrescription);

export default router;
