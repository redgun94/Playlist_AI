import express, { Router } from 'express';
import { register } from '../controllers/authController';

const router: Router = express.Router();

// POST /api/auth/register

router.post('/register', register);

export default router;