import { Router } from 'express';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { isAdmin } from '../../middlewares/isAdmin';
import { getProductionReport } from './controller';

const router = Router();

router.get('/production', isAuthenticated, isAdmin, getProductionReport);

export default router;
