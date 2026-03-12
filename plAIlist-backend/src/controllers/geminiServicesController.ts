import { Request, Response } from 'express';
import { FunctionCallingConfigMode, GoogleGenAI, Type } from '@google/genai';
import ChatUserSession from '../models/chatSession';
import { PLAILIST_RESPONSE_SCHEMA, PLAILIST_SYSTEM_INSTRUCTION } from '../config/aiConfig';
import { getTrackByName } from './spotifyController';

export const geminiCall = async (req: Request, res: Response): Promise<void> => {
    console.log('🔥 geminiCall called');
    console.log('Body:', req.body);

    try {
        const { prompt, userId } = req.body;
        let chatSession = await ChatUserSession.findOne({ userId });
        if(!chatSession){
            console.log('Chat session not found, creating new one');
            chatSession = new ChatUserSession({
                userId,
                history: []
            });
            await chatSession.save();
        }
        console.log("Chat session created or found");
        if (!prompt || typeof prompt !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Prompt is required and must be a string'
            });
            return;
        }

        const genApy = process.env.GEMINI_API_KEY;
        if (!genApy) {
            res.status(500).json({
                success: false,
                message: 'GEMINI_API_KEY environment variable is not set',
                systemInstruction: 'You are a music playlist generator. Always respond with a playlist in the required JSON format with playlist_name and tracks array.'
            });
            return;
        }
    
        const ai = new GoogleGenAI({ apiKey: genApy });
        const history = chatSession.history.map(entry => ({
            role: entry.role,
            parts: entry.parts.map(part => ({ text: part.text }))
        }));
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash-lite',
            history: history,
            config:{
                systemInstruction: PLAILIST_SYSTEM_INSTRUCTION ,
                responseMimeType: 'application/json',   
                responseSchema: PLAILIST_RESPONSE_SCHEMA  
            }
        });
        const result = await chat.sendMessage({message: prompt});
    
        chatSession.history = (await chat.getHistory()).map(content => ({
            role: content.role || '',
            parts: content.parts?.filter(part => part.text !== undefined).map(part => ({ text: part.text || '' })) || []
        }));
        await chatSession.save();

        const response = result.candidates?.[0] as any;
        const response_string = result.text || "";

        if (!response_string) {
            res.status(500).json({
                success: false,
                message: 'Empty response from Gemini API'
            });
            return;
        }

        let response_json;
        try {
            response_json = JSON.parse(response_string);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).json({
                success: false,
                message: 'Invalid JSON response from Gemini API'
            });
            return;
        }

        const tracksBySpotify = [];

        if (response?.finishReason === "STOP") {
            if(response_json.type === 'playlist'){
                const tracks = response_json.playlist.tracks;
                console.log("Tracks ", tracks);
                for(let track of  tracks){
                    const response = await getTrackByName(track);
                    console.log(response?.data.tracks.items);
                    tracksBySpotify.push(response?.data.tracks.items);
                }
                
            }
            res.status(200).json({
                success: true,
                message: "Successfully Response from GeminiAI api",
                data: response_json
            });
        } else {
            res.status(400).json({
                success: false,
                message: response?.finishReason || 'Unexpected response from Gemini API'
            });
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }

}
