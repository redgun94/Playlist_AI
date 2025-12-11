import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlailist extends Document{
    playlistName : string;
    memoDescription : string;
    createdAt: Date;
    updatedAt: Date;
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
            }},
            {
                timestamps: true
            }
        );



const Playlist: Model<IPlailist> = mongoose.model<IPlailist>('Playlist', playlistSchema);
export default Playlist;
