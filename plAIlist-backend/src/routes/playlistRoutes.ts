import express, { Router } from 'express';
import { createPlaylist, loadPlaylists, deletePlaylist, updatePlaylist, addTrackToPlaylist, removeTrack } from '../controllers/playlistController';

const router: Router = express.Router();

// POST /api/auth/register

router.post('/createPlaylist', createPlaylist);
router.get('/loadPlaylists',loadPlaylists);
router.delete('/deletePlaylist', deletePlaylist);
router.put('/updatePlaylist',updatePlaylist);
router.post('/:playlistId/track',addTrackToPlaylist);
router.delete('/:trackId/removeTrack',removeTrack);

export default router;