export interface GeminiRequest {
    prompt: string;
    
}

export interface GeminiResponse {
    success: boolean;
    message?: string;
    data?: any;
}
