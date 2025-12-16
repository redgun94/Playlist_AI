import { Injectable } from '@angular/core';
import { DataPlaylist, PlaylistResponse } from '../models/playlist.models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SavePlaylistServiceService {
  private apiUrl;


  constructor(private http: HttpClient) { 
    this.apiUrl = 'http://localhost:3000/api/auth';
  }

  createPlaylist(playlistData : DataPlaylist): Observable<PlaylistResponse> {
    return this.http.post<PlaylistResponse>(`${this.apiUrl}/register`, playlistData)
      .pipe(
        tap(response => {
          // Si el registro es exitoso, guardar token y usuario
          if (response.success && response.token) {
            this.saveAuthData(response.token, response.user);
          }
        }),
        catchError(this.handleError)
      );
  }
}
