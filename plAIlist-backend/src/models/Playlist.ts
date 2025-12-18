import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlailist extends Document{
    playlistName : string;
    memoDescription? : string;
    tracks: any[];
    createdAt: Date;
    updatedAt: Date;
    userId: string
};

    const playlistSchema = new Schema({
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
            type: [Schema.Types.Mixed],
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



const Playlist: Model<IPlailist> = mongoose.model<IPlailist>('Playlist', playlistSchema);
export default Playlist;
