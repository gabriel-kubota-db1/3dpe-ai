import { Router } from 'express';
import * as controller from './controller';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
// import { checkPermissions } from '../../middlewares/checkPermissions'; // Example for RBAC

const router = Router();

// --- Physiotherapist Routes ---
const physioRouter = Router();
physioRouter.use(isAuthenticated); // All physio routes require authentication

physioRouter.get('/', controller.listPhysioOrders);
physioRouter.get('/:id', controller.getPhysioOrderDetails);
physioRouter.post('/shipping', controller.getShippingOptions);
physioRouter.post('/checkout', controller.createCheckout);
physioRouter.post('/:id/pay', controller.processMockPayment);
physioRouter.patch('/:id/status', controller.updatePhysioOrderStatus);

router.use('/physiotherapist', physioRouter);


// --- Industry/Admin Routes ---
const industryRouter = Router();
industryRouter.use(isAuthenticated); // All industry routes require authentication
// industryRouter.use(checkPermissions(['admin', 'industry'])); // Example for RBAC

industryRouter.get('/', controller.listAllOrders);
industryRouter.get('/:id', controller.getAdminOrderDetails);
industryRouter.patch('/:id/status', controller.updateOrderStatus);
industryRouter.post('/batch-status', controller.batchUpdateStatus);
industryRouter.get('/export/csv', controller.exportOrdersToCsv);

router.use('/industry', industryRouter);


export default router;

/**
 * To use these routes, import this file in your main application file (e.g., src/index.ts)
 * and use it with your Express app instance:
 *
 * import ordersRouter from './domains/orders/routes';
 *
 * app.use('/api/v1/orders', ordersRouter);
 */
