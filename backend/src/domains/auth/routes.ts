import { Router } from 'express';
import { login, refresh, forgotPassword, resetPassword } from './controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from './validators.js';

const router = Router();

router.post('/login', validateRequest({ body: loginSchema }), login);
router.post('/refresh', validateRequest({ body: refreshSchema }), refresh);
router.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPassword);

export default router;
