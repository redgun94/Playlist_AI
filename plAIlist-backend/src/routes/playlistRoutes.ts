import express, { Router } from 'express';
import { createPlaylist } from '../controllers/playlistController';

const router: Router = express.Router();

// POST /api/auth/register

router.post('/createPlaylist', createPlaylist);

export default router;