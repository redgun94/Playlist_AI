import express, { Router } from 'express';
import { createPlaylist, loadPlaylists, deletePlaylist, updatePlaylist, addTrackToPlaylist } from '../controllers/playlistController';

const router: Router = express.Router();

// POST /api/auth/register

router.post('/createPlaylist', createPlaylist);
router.get('/loadPlaylists',loadPlaylists);
router.delete('/deletePlaylist', deletePlaylist);
router.put('/updatePlaylist',updatePlaylist);
router.post('/:playlistId/track',addTrackToPlaylist)

export default router;