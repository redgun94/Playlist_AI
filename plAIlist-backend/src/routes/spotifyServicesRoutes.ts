import express, { Router } from 'express';
import { getTokenSpotify, searchArtists } from '../controllers/spotifyController';

const router: Router = express.Router();

router.get('/searchArtists',searchArtists);

export default router ;