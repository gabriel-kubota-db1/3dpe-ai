import { Router } from 'express';
import * as controller from './controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { insoleModelSchema, insoleModelUpdateSchema } from './validators';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { isAdmin } from '../../middlewares/isAdmin';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/', controller.getAllInsoleModels);
router.post('/', validateRequest({ body: insoleModelSchema }), controller.createInsoleModel);
router.put('/:id', validateRequest({ body: insoleModelUpdateSchema }), controller.updateInsoleModel);
router.delete('/:id', controller.deleteInsoleModel);

export default router;
