import { Router } from 'express';
import * as controller from './controller';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  userUpdateSchema,
  loginSchema,
  physiotherapistRegisterSchema,
  industryRegisterSchema,
} from './validators';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { isAdmin } from '../../middlewares/isAdmin';

const router = Router();

// Auth
router.post('/login', validateRequest({ body: loginSchema }), controller.login);

// Public registration (if any, e.g. patients)
// router.post('/register', validateRequest({ body: userCreateSchema }), controller.register);

// Admin-only registration
router.post(
  '/register/physiotherapist',
  isAuthenticated,
  isAdmin,
  validateRequest({ body: physiotherapistRegisterSchema }),
  controller.registerPhysiotherapist
);
router.post(
  '/register/industry',
  isAuthenticated,
  isAdmin,
  validateRequest({ body: industryRegisterSchema }),
  controller.registerIndustry
);

// User profile
router.get('/profile', isAuthenticated, controller.getProfile);
router.put('/profile', isAuthenticated, validateRequest({ body: userUpdateSchema }), controller.updateProfile);

// Admin User Management
router.get('/', isAuthenticated, isAdmin, controller.getAllUsers);
router.get('/:id', isAuthenticated, isAdmin, controller.getUserById);
router.put('/:id', isAuthenticated, isAdmin, validateRequest({ body: userUpdateSchema }), controller.updateUser);
router.delete('/:id', isAuthenticated, isAdmin, controller.deleteUser);


export default router;
