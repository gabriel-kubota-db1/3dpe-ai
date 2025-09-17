import { Router } from 'express';
import * as controller from './controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { coatingSchema, coatingUpdateSchema } from './validators';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { isAdmin } from '../../middlewares/isAdmin';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/', controller.getAllCoatings);
router.post('/', validateRequest({ body: coatingSchema }), controller.createCoating);
router.put('/:id', validateRequest({ body: coatingUpdateSchema }), controller.updateCoating);
router.delete('/:id', controller.deleteCoating);

export default router;
