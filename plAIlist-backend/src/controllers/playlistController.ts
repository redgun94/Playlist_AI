import { Request , Response } from 'express';
import Playlist, { IPlaylist } from '../models/Playlist';


interface PlaylistRequestBody {
    id : string;
    playlistName : String;
    memoDescription : String;
    tracks: IPlaylist[];
    userId: string;

}
interface PlaylistsArrayResBody {
    playlistsArray: IPlaylist[] ;
}
export const createPlaylist = async (req: Request< {}, {}, PlaylistRequestBody>, res: Response): Promise <void> => {
    
    try{
        
        const { id, playlistName, memoDescription, tracks, userId } = req.body;
        //Validar la exist
        if(!playlistName || (playlistName.length < 3)){
            res.status(400).json({ 
                success: false,
                message: "Please enter a playlist name with at least 3 characters"
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
        catch(error:any){

            // Error de índice único (duplicate key)
            if (error.code === 11000) {
                 res.status(400).json({
                success: false,
                message: "Playlist name already exists. Enter a new name."
                
                });
                return;
            }


            if((error as any).name === 'ValidationError'){
                const messages = Object.values((error as any).errors).map((err: any) => err.message);
                res.status(400).json({ 
                    success: false,
                    message: messages[0]
                  });
                  return;
            }
                // Error del servidor
            res.status(500).json({ 
            success: false,
            message: 'Error al crear la playlist. Intenta nuevamente.' 
            });
        }
    };
export const loadPlaylists = async(req: Request, res: Response): Promise<void> => {

    try{
        const userPlaylists = await Playlist.find();
        if(!userPlaylists.length){
            res.status(400).json({
                success : false,
                message: "You haven't saved any playlists"
                
            });
            return;
        }
        res.status(200).json({
            success : true,
            message: "User's playlists loaded",
            playlists : userPlaylists
        });
       
        

    }
    catch(error:any){
        res.status(500).json({
            success: false,
            message: "Error retrieving user playlists"
        })
    };
}
