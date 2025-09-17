import { Router } from 'express';
import { 
  login, 
  forgotPassword, 
  resetPassword,
  refreshToken,
  logout,
  logoutAll,
  getActiveSessions,
  revokeSession
} from './controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  refreshTokenSchema,
  logoutSchema
} from '../users/validators.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

// Public auth routes
router.post('/login', validateRequest({ body: loginSchema }), login);
router.post('/refresh-token', validateRequest({ body: refreshTokenSchema }), refreshToken);
router.post('/logout', validateRequest({ body: logoutSchema }), logout);
router.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPassword);

// Protected auth routes (require authentication)
router.post('/logout-all', isAuthenticated, logoutAll);
router.get('/sessions', isAuthenticated, getActiveSessions);
router.delete('/sessions/:tokenId', isAuthenticated, revokeSession);

export default router;
