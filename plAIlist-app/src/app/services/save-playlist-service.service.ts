import { Injectable } from '@angular/core';
import { Playlist, PlaylistsResponse } from '../models/playlist.models';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { response } from 'express';


// interface Playlist {
//   id: string;
//   name: string;
//   description: string;
//   tracks: any[];
//   createdAt: Date;
//   userId: string;
// }
@Injectable({
  providedIn: 'root'
})

export class SavePlaylistService {
  private apiUrl;

  //Estado central de playlists
  private playlistsSubjet = new BehaviorSubject<Playlist[]>([]);
  public playlists$ = this.playlistsSubjet.asObservable();
// Playlist actualmente seleccionada
  private currentPlaylistSubject = new BehaviorSubject<Playlist | null>(null);
  public currentPlaylist$ = this.currentPlaylistSubject.asObservable();
  private messageError!: String;
  private error: String = "";
  
  constructor(private http: HttpClient) { 
    this.apiUrl = 'http://localhost:3000/api/playlist';
    //Cargar playlists al inicializar
    this.loadPlaylists();
  }

  get currentPlaylists(): Playlist[] {
    return this.playlistsSubjet.value
  }

  loadPlaylists(): Observable<any>{
    return this.http.get<PlaylistsResponse>(`${this.apiUrl}`).pipe(
      tap(response => {
        if (response.success){
          this.playlistsSubjet.next(response.playlists);
        }
      })
    );
  }
  //Crear nueva playlist
  createPlaylist(playlistData : Playlist): Observable<PlaylistsResponse> {
    return this.http.post<PlaylistsResponse>(`${this.apiUrl}/createPlaylist`, playlistData)
      .pipe(
        tap(response => {
  
          // Agregar la nueva playlist al contexto
          if (response.success) {
            const currentplaylist = response.playlist;
            this.currentPlaylistSubject.next(currentplaylist);
            const currentPlaylists = response.playlists;
            this.playlistsSubjet.next(currentPlaylists);
            return;
          }
        }),
        catchError(this.handleError)
      );
  }

  //Add track a la playlist
  addTrackToPlaylist(playlistId: string, track: any): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/${playlistId}/track`,{ track }).pipe(
      tap(response => {
        if(response.success){
          //Actualizar la playlist en el front
          const updatedPlaylists = this.currentPlaylists.map( playlist =>{
            if (playlist.id === playlistId){
              return playlist = {...playlist, tracks: [...playlist.tracks,track]}; 
            }else {
              return playlist;
            }
          });
          this.playlistsSubjet.next(updatedPlaylists); 
        }
      })
    )
  }
  private handleError(error: HttpErrorResponse) {
    console.log("tirando el error que viene del servidor :", error.error.message);
    //  throwError(() => error.error.message || 'Unexpected error');
     return throwError(() => error.error.message) ;
  }
  
}
