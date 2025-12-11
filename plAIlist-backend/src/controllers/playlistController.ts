import { Request , Response } from 'express';
import { Playlist } from '../models/Playlist';


interface PlaylistRequestBody {
    playlisName : String;
    memoDescriptip : String;
    
}