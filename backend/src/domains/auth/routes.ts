import { Router } from 'express';
import { login, forgotPassword, resetPassword } from './controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../users/validators.js';

const router = Router();

router.post('/login', validateRequest({ body: loginSchema }), login);
router.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPassword);

export default router;
