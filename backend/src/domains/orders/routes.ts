import { Router } from 'express';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { isPhysiotherapist } from '../../middlewares/isPhysiotherapist';
import { isAdmin } from '../../middlewares/isAdmin';
import { isIndustry } from '../../middlewares/isIndustry'; // Assuming this will be created
import { validateRequest } from '../../middlewares/validateRequest';
import { checkoutSchema, statusUpdateSchema, batchStatusUpdateSchema, shippingSchema } from './validators';
import * as controller from './controller';

const router = Router();

// --- Physiotherapist Routes ---
const physioRouter = Router();
physioRouter.get('/', controller.listPhysioOrders);
physioRouter.post('/shipping', validateRequest({ body: shippingSchema }), controller.getShippingOptions);
physioRouter.post('/checkout', validateRequest({ body: checkoutSchema }), controller.createCheckout);

// --- Industry Routes ---
const industryRouter = Router();
industryRouter.get('/', controller.listAllOrders);
industryRouter.put('/:id/status', validateRequest({ body: statusUpdateSchema }), controller.updateOrderStatus);

// --- Admin Routes ---
const adminRouter = Router();
adminRouter.get('/', controller.listAllOrders);
adminRouter.put('/status', validateRequest({ body: batchStatusUpdateSchema }), controller.batchUpdateStatus);
adminRouter.get('/export/csv', controller.exportOrdersToCsv);

// Mount role-specific routers
router.use('/physiotherapist', isAuthenticated, isPhysiotherapist, physioRouter);
router.use('/industry', isAuthenticated, isIndustry, industryRouter);
router.use('/admin', isAuthenticated, isAdmin, adminRouter);

export default router;
