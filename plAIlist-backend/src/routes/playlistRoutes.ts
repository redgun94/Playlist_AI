import express, { Router } from 'express';
import { createPlaylist, loadPlaylists } from '../controllers/playlistController';

const router: Router = express.Router();

// POST /api/auth/register

router.post('/createPlaylist', createPlaylist);
router.get('/loadPlaylists',loadPlaylists);

export default router;