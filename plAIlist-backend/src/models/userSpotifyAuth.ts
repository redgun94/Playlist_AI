import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IUserSpotifyAuth extends Document{

    id : string;
    userId: Types.ObjectId;
    spotifyUserId: string;
    spotifyEmail: string,
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scopes: "playlist-modify-private playlist-modify-public";
    createdAt : Date;
    updatedAt : Date;
}

const UserSpotifyAuthSchema = new Schema<IUserSpotifyAuth>({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    spotifyUserId: { type: String, required: true },
    spotifyEmail: { type: String, required : true},
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  });
  

const UserSpotifyAuth :Model<IUserSpotifyAuth> = mongoose.model<IUserSpotifyAuth>('UserSpotifyAuth', UserSpotifyAuthSchema);
export default UserSpotifyAuth;