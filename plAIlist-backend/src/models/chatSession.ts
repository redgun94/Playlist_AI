import mongoose, { Schema, Document } from "mongoose";

export interface IChatSession extends Document{

    userId : string;
    history: {
        role : string;
        parts: {text : string}[]
    }[];
    createdAt : Date;
    updatedAt : Date;
}

const ChatUserSessionSchema = new Schema<IChatSession>({
    userId: { type: String, required: true, unique: true },
    history: [{
        role: { type: String },
        parts: [{ text: { type: String } }]
    }],
}, { timestamps: true });

export default mongoose.model<IChatSession>('ChatUserSession', ChatUserSessionSchema);