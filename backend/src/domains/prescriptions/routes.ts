import { Router } from 'express';
import * as controller from './controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { prescriptionSchema } from './validators';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { isPhysiotherapist } from '../../middlewares/isPhysiotherapist';

const router = Router();

router.use(isAuthenticated, isPhysiotherapist);

router.get('/', controller.getAllPrescriptions);
router.post('/', validateRequest({ body: prescriptionSchema }), controller.createPrescription);
router.get('/:id', controller.getPrescriptionById);
// router.put('/:id', ...);
// router.delete('/:id', ...);

export default router;
