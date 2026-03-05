import express, { Router } from 'express';
import { geminiCall } from '../controllers/geminiServicesController';
const router: Router = express.Router();


router.post('/call', geminiCall);

export default router;