import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlaylist extends Document{
    playlistName : string;
    memoDescription? : string;
    tracks: any[];
    createdAt: Date;
    updatedAt: Date;
    userId: string
};

    const playlistSchema = new Schema<IPlaylist>({
        playlistName : { 
            type: String, 
            required : true, 
            unique: true, 
            minlength: [3, "Invalid Name"]},
        memoDescription : {
            type : String, 
            required : false,
            },
        tracks: {
            type: [],
            default: [],
        },
        userId: {
            type: String,
            required: true,
        }
        },
            {
                timestamps: true
            }
        );



const Playlist: Model<IPlaylist> = mongoose.model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;
