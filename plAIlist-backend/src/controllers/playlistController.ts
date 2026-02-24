import { Request ,  Response } from 'express';
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
                _id: newPlaylist._id,
                playlistName: newPlaylist.playlistName,
                memoDescription: newPlaylist.memoDescription,
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

export const deletePlaylist = async(req:Request, res:Response):Promise<void> =>{
    try{
        const { id, playlistName, memoDescription, tracks, userId } = req.body;
        console.log(id,playlistName,memoDescription);
        const deletedPlaylist = await Playlist.deleteOne({playlistName : playlistName})         
        
        if(!deletedPlaylist.acknowledged){
             res.status(404).json({
                success : false,
                message: "Playlist not found"
            })
            return;
        }
       
        res.status(200).json({
            success : true,
            message : "Plalist deleted successfully",
            playlistId : deletedPlaylist.acknowledged
        })
        
    }catch(error){
        res.status(500).json({
            success: false,
            message: `Server Error : ${error}`
        });
    }}

export const updatePlaylist = async(req:Request, res:Response):Promise<void>=>{
    try{
        const playlist = req.body;
        const subjectPlaylist = await Playlist.updateOne({_id: playlist._id }, playlist);
        console.log('Update result:', subjectPlaylist);
        if (subjectPlaylist?.matchedCount === 0) {
            await Playlist.create(playlist);
            return
        }
        if(subjectPlaylist.modifiedCount === 0){
            res.status(404).json({
                success : false,
                message : "Server Error"
            })
            return;
        }
        res.status(200).json({
            success : true,
            message : "Playlist updated successfully"
        })
    }
    catch(error : any){
        res.status(500).json({
            success : false,
            message : `Server Error : ${error}` 
        })
    };
}
export const addTrackToPlaylist = async(req: Request, res: Response):Promise<void>=>{
   
    try{
        
        const playlistId = req.params.playlistId;
        const track = req.body.track;
        const query = { $push: {tracks: track}};
        const updateDocument = { new: true};
        const playlist = await Playlist.findByIdAndUpdate(playlistId,query,updateDocument);
        if(track.name != playlist?.tracks[playlist?.tracks.length - 1].name){
            res.status(404).json({
                success : false,
                messages : "Database Error"
            })
            return;
        }
        res.status(200).json({
            success : true,
            messages : "Track added successfully"
        })
    }
    catch(error){
        res.status(500).json({
            success : false,
            messages : "Server Error : " + error
        })
    }

   

}
export const removeTrack = async (req: Request, res: Response): Promise<void> => {
    try {
        const trackId = req.params.trackId;
        const { playlistId } = req.body;

        if (!playlistId) {
            res.status(400).json({
                success: false,
                message: "Playlist ID is required"
            });
            return;
        }

        const subjectPlaylist = await Playlist.findById(playlistId);

        if (!subjectPlaylist) {
            res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
            return;
        }

        const trackExists = subjectPlaylist.tracks.some(track => track.id === trackId);
        if (!trackExists) {
            res.status(404).json({
                success: false,
                message: "Track not found in playlist"
            });
            return;
        }

        subjectPlaylist.tracks = subjectPlaylist.tracks.filter(track => track.id !== trackId);
        await subjectPlaylist.save();
        
        res.status(200).json({
            success: true,
            message: "Track removed successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}