import express, { Router } from 'express';
import { getTokenSpotify } from '../controllers/spotifyController';

const router: Router = express.Router();

router.get('/getToken',getTokenSpotify);

export default router ;