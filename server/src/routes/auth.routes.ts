import { Router } from 'express';
import { register, login, verifyEmail, resendVerificationEmail } from '../controllers/auth.controller';
import { resendUserVerificationEmail } from '../services/auth.service';


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post(
    '/resend-verification',
    resendVerificationEmail
)

export default router;