import { Router } from 'express';
import { getProfile, updateProfile } from './controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { updateUserProfileSchema } from './validators.js';

const router = Router();

router.get('/profile', isAuthenticated, getProfile);
router.put('/profile', isAuthenticated, validateRequest({ body: updateUserProfileSchema }), updateProfile);

export default router;
