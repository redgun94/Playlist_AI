import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { User } from '../models/auth.model';
import { GeminiResponse } from '../models/gemini.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/enviroment';


@Injectable({
  providedIn: 'root'
})
export class GeminiServicesService {

    authServices: AuthService = inject(AuthService);
    apiUrl: string = `${environment.apiUrl}/api/gemini`;
    userId: string = '';

  constructor(private http : HttpClient) {
    this.authServices.currentUser.subscribe(user => {
      this.userId = user?.id || '';
    });
  }

  geminiServices(prompt: string, userId?: string): Observable<GeminiResponse> {
    const uid = userId || this.userId;
    return this.http.post<GeminiResponse>(`${this.apiUrl}/call`, { prompt, userId: uid }).pipe(
      tap(response => {
        if (response.success) {
           console.log(response.data);
           return response.data;
        }
      })
    );
  }

}
