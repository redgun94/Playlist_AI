import express, { Router } from 'express';
import { callbackGoogle, callbackSpotify, getUserSpotify, login, loginSpotify, register, ssoGoogle } from '../controllers/authController';
import { createPlaylist } from '../controllers/playlistController';
const router: Router = express.Router();

// POST /api/auth/register

router.post('/register', register);
router.post('/login', login);
router.get('/spotify/login', loginSpotify);
router.get('/spotify/callback',callbackSpotify);
router.get('/getUserSpotify',getUserSpotify);
router.get('/ssoGoogle',ssoGoogle);
router.get('/ssoGoogle/callback',callbackGoogle);




export default router;