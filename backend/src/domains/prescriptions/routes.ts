import { Router } from 'express';
import * as controller from './controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { createPrescriptionSchema, updatePrescriptionSchema } from './validators';
import { isAuthenticated } from '../../middlewares/isAuthenticated';

const router = Router();

router.use(isAuthenticated);

router.post('/', validateRequest({ body: createPrescriptionSchema }), controller.createPrescription);
router.get('/', controller.getAllPrescriptions);
router.get('/:id', controller.getPrescriptionById);
router.put('/:id', validateRequest({ body: updatePrescriptionSchema }), controller.updatePrescription);
router.delete('/:id', controller.deletePrescription);

export default router;
