import { Router } from 'express';
import * as controller from './controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { createPatientSchema, updatePatientSchema } from './validators';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { isPhysiotherapist } from '../../middlewares/isPhysiotherapist';

const router = Router();

router.use(isAuthenticated, isPhysiotherapist);

router.get('/', controller.getAllPatients);
router.post('/', validateRequest({ body: createPatientSchema }), controller.createPatient);
router.get('/:id', controller.getPatientById);
router.put('/:id', validateRequest({ body: updatePatientSchema }), controller.updatePatient);
router.get('/:id/audit-logs', controller.getPatientAuditLogs);

export default router;
