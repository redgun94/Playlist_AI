import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { User } from '../models/auth.model';
import { GeminiResponse } from '../models/gemini.model';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class GeminiServicesService {

    authServices: AuthService = inject(AuthService);
    apiUrl: string = 'http://localhost:3000/api/gemini';
    userId: string | undefined= '';
    user!: User | null;
    private genAI = "AIzaSyD2azlyyRwEGePRBw7CXozzzK_o9U9wgJ4";
    
  constructor(private http : HttpClient) {
    this.authServices.currentUser.subscribe(user => this.user = user);
    this.userId = this.user?.id;
  }

  geminiServices(prompt: string, userId: any = this.userId): Observable<GeminiResponse> {
    console.log(prompt);
    return this.http.post<GeminiResponse>(`${this.apiUrl}/call`, { prompt, userId }).pipe(
      tap(response => {
        if (response.success) {
           console.log(response.data);
           return response.data;
        }
      })
    );
  }

}
