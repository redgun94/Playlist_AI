import { Request , Response } from 'express';
import Playlist, { IPlailist } from '../models/Playlist';


interface PlaylistRequestBody {
    id : string,
    playlistName : String;
    memoDescription : String;
    tracks: any[];
    userId: string;
    
}

export const createPlaylist = async (req: Request< {}, {}, PlaylistRequestBody>, res: Response): Promise <void> => {
    try{
        const { id, playlistName, memoDescription, tracks, userId } = req.body;
        //Validar la exist
        if(!playlistName || (playlistName.length< 3)){
            res.status(400).json({ 
                success: false,
                message: "Please enter a playlist name with at least 4 characters"
              });
              return;
        }
        //Verificar si exite otra playlist con mismo nombre
        const alreadyPlaylist = await Playlist.findOne({playlistName : playlistName.toLowerCase()});
        if(alreadyPlaylist){
            res.status(400).json({ 
                success: false,
                message: "Playlist name already exists. Enter a new name."
              });
              return;
        }

        const newPlaylist = new Playlist({
            playlistName,
            memoDescription: memoDescription ? memoDescription : null,
            tracks,
            userId
        });

        await newPlaylist.save();

        res.status(201).json({
            success: true,
            message: "Playlist created successfully.",
            playlist: {
                id: newPlaylist._id,
                name: newPlaylist.playlistName,
                description: newPlaylist.memoDescription,
                tracks: newPlaylist.tracks,
                userId: newPlaylist.userId
            }
        });}
        catch(error){
            if((error as any).name === 'ValidationError'){
                const messages = Object.values((error as any).errors).map((err: any) => err.message);
                res.status(400).json({ 
                    success: false,
                    message: messages[0]
                  });
                  return;
            }
                // Error del servidor
            console.error('Error en registro:', error);
            res.status(500).json({ 
            success: false,
            message: 'Error al registrar usuario. Intenta nuevamente.' 
            });
        }
    };
