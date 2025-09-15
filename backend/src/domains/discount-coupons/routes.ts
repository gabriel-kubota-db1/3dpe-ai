import { Router } from 'express';
import * as controller from './controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { discountCouponSchema } from './validators';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { isAdmin } from '../../middlewares/isAdmin';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/', controller.getAllDiscountCoupons);
router.post('/', validateRequest({ body: discountCouponSchema }), controller.createDiscountCoupon);
router.put('/:id', validateRequest({ body: discountCouponSchema }), controller.updateDiscountCoupon);
router.delete('/:id', controller.deleteDiscountCoupon);

export default router;
