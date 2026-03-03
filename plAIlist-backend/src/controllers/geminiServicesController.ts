import { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';


export const geminiCall = async (req: Request, res: Response): Promise<void> => {
    console.log('🔥 geminiCall called');
    console.log('Body:', req.body);
    const schema_res = {
        type: "OBJECT",
        properties: {
            playlist_name: { type: "STRING" },
            description: { type: "STRING" },
            tracks: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        artist: { type: "STRING" },
                        year: { type: "STRING" },
                    },
                    required: ["title", "artist"]
                }
            }
        },
        required: ["playlist_name", "tracks"]
    };
    try {
        const { prompt } = req.body;
        console.log(prompt);
        if (!prompt || typeof prompt !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Prompt is required and must be a string'
            });
            return;
        }

        const genApy = "AIzaSyAI7FlKs1ACLx7vlOqIBtva1HrYgzvLIiw";
        if (!genApy) {
            res.status(500).json({
                success: false,
                message: 'GEMINI_API_KEY environment variable is not set',
                systemInstruction: 'You are a music playlist generator. Always respond with a playlist in the required JSON format with playlist_name and tracks array.'
            });
            return;
        }
        
        const ai = new GoogleGenAI({ apiKey: genApy });
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config:{
                responseMimeType: 'application/json',
                responseSchema: schema_res
            }
        });

        const response = result.candidates?.[0];
        console.log(response);
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

        console.log(response_json);

        if (response?.finishReason === "STOP") {
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
