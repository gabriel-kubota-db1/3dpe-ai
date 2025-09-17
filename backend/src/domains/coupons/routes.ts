import { Router } from 'express';
import * as controller from './controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { couponSchema, couponUpdateSchema } from './validators';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { isAdmin } from '../../middlewares/isAdmin';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/', controller.getAllCoupons);
router.post('/', validateRequest({ body: couponSchema }), controller.createCoupon);
router.put('/:id', validateRequest({ body: couponUpdateSchema }), controller.updateCoupon);
router.delete('/:id', controller.deleteCoupon);

export default router;
