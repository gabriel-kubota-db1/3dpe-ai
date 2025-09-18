import { Router } from 'express';
import * as controller from './controller';
import { isAuthenticated } from '../../middlewares/isAuthenticated';

const router = Router();

// TODO: Add checkPermissions middleware for admin routes
router.get('/', isAuthenticated, controller.getAllCoupons);
router.post('/', isAuthenticated, controller.createCoupon);
router.put('/:id', isAuthenticated, controller.updateCoupon);
router.delete('/:id', isAuthenticated, controller.deleteCoupon);

// Public/Physio route
router.post('/validate', isAuthenticated, controller.validateCoupon);

export default router;
