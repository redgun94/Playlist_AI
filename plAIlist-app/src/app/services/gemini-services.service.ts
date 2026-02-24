import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GeminiRequest {
  prompt: string;
  userId: string;
}

export interface GeminiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiServicesService {

  private apiUrl = 'http://localhost:3000/api/gemini';
    
  constructor(private http: HttpClient) { }

  generateContent(prompt: string, userId: string): Observable<GeminiResponse> {
    const request: GeminiRequest = { prompt, userId };
    return this.http.post<GeminiResponse>(`${this.apiUrl}/generate`, request);
  }

  setApiKey(apiKey: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }

  getApiKey(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  }
}
