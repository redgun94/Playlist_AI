import express, { Router } from 'express';
import { login, register } from '../controllers/authController';
import { createPlaylist } from '../controllers/playlistController';
import { geminiCall } from '../controllers/geminiServicesController';
const router: Router = express.Router();


router.post('/call', geminiCall);

export default router;