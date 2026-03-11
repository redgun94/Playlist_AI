import express, { Router } from 'express';
import { getAlbumsByArtist, getTokenSpotify, getTracksByAlbums, searchArtists, searchSongsByArtist } from '../controllers/spotifyController';

const router: Router = express.Router();

router.get('/searchArtists',searchArtists);
router.get('/getTracksByArtist',searchSongsByArtist);
router.get('/getAlbumsByArtist',getAlbumsByArtist);
router.get('/getTracksByAlbums',getTracksByAlbums);






export default router ;