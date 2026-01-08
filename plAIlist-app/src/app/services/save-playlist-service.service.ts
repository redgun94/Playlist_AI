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
  private playlistsSubject = new BehaviorSubject<Playlist[]>([]);
  public playlists$ = this.playlistsSubject.asObservable();
// Playlist actualmente seleccionada
  private currentPlaylistSubject = new BehaviorSubject<Playlist | null>(null);
  public currentPlaylist$ = this.currentPlaylistSubject.asObservable();
  private messageError!: String;
  private error: String = "";
  
  constructor(private http: HttpClient) { 
    this.apiUrl = 'http://localhost:3000/api/playlist';
    //Cargar playlists al inicializar
    this.loadPlaylists().subscribe();
    console.log("en el constructor",this.playlists$);
  }

  get currentPlaylists(): Playlist[] {
    return this.playlistsSubject.value
  }

  loadPlaylists(): Observable<any>{
    const url = `${this.apiUrl}/loadPlaylists`;
    return this.http.get<PlaylistsResponse>(url).pipe(
      tap(response => {
        if (response.success){
          this.playlistsSubject.next(response.playlists);
          console.log("Message", this.playlistsSubject);
         // console.log(response.playlists);
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
          this.playlistsSubject.next(updatedPlaylists); 
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
