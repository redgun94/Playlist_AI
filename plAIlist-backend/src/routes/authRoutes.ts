import express, { Router } from 'express';
import { callbackGoogle, callbackSpotify, getUserSpotify, getSpotifyPlaybackToken, login, loginSpotify, register, ssoGoogle,getMe } from '../controllers/authController';
import { createPlaylist } from '../controllers/playlistController';
import { verifyToken } from '../middlewares/auth.middleware';
const router: Router = express.Router();

// POST /api/auth/register

router.post('/register', register);
router.post('/login', login);
router.get('/spotify/login', loginSpotify);
router.get('/spotify/callback',callbackSpotify);
router.get('/getUserSpotify',getUserSpotify);
router.get('/spotify/playback-token', verifyToken, getSpotifyPlaybackToken);
router.get('/ssoGoogle',ssoGoogle);
router.get('/ssoGoogle/callback',callbackGoogle);
router.get('/me',getMe);




export default router;