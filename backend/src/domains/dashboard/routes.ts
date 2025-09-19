import { Router } from 'express';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { isAdmin } from '../../middlewares/isAdmin';
import { getDashboardMetrics } from './controller';

const router = Router();

router.get('/metrics', isAuthenticated, isAdmin, getDashboardMetrics);

export default router;
