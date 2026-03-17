import express, { Router } from 'express';
import { callbackSpotify, getUserSpotify, login, loginSpotify, register } from '../controllers/authController';
import { createPlaylist } from '../controllers/playlistController';
const router: Router = express.Router();

// POST /api/auth/register

router.post('/register', register);
router.post('/login', login);
router.get('/spotify/login', loginSpotify);
router.get('/spotify/callback',callbackSpotify);
router.get('/getUserSpotify',getUserSpotify);

export default router;