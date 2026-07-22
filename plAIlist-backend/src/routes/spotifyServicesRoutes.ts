import express, { Router } from 'express';
import { exportPlaylist, getAlbumsByArtist, getTokenSpotify, getTracksByAlbums, searchArtists, searchSongsByArtist, startPlayback } from '../controllers/spotifyController';
import { verifyToken } from '../middlewares/auth.middleware';

const router: Router = express.Router();

router.get('/searchArtists',searchArtists);
router.get('/getTracksByArtist',searchSongsByArtist);
router.get('/getAlbumsByArtist',getAlbumsByArtist);
router.get('/getTracksByAlbums',getTracksByAlbums);
router.post('/exportPlaylist',verifyToken, exportPlaylist);
router.put('/play', verifyToken, startPlayback);






export default router ;