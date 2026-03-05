// src/config/aiConfig.ts

export const PLAILIST_SYSTEM_INSTRUCTION = `You are an expert music assistant called PlAIlist.
- If the user requests a playlist, fill the playlist field and set type as "playlist".
- If the user asks a general music question, set type as "text" and playlist as null.
- If the user asks about something unrelated to music, kindly redirect the conversation back to music.
- Always respond in the same language the user is using.`;

export const PLAILIST_RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        type: { type: 'STRING', description: '"playlist" or "text"' },
        message: { type: 'STRING' },
        playlist: {
            type: 'OBJECT',
            properties: {
                playlist_name: { type: 'STRING' },
                description: { type: 'STRING' },
                tracks: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            title: { type: 'STRING' },
                            artist: { type: 'STRING' },
                            year: { type: 'STRING' },
                        },
                        required: ['title', 'artist']
                    }
                }
            }
        }
    },
    required: ['type', 'message']
} as any;