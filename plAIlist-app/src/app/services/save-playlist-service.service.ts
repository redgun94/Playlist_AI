import { Injectable } from '@angular/core';
import { deletedResponse, Playlist, PlaylistsResponse } from '../models/playlist.models';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { response } from 'express';
import { json } from 'node:stream/consumers';


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

  private  apiUrl;

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
  }

  get currentPlaylists(): Playlist[] {
    return this.playlistsSubject.value
  }
  set currentSubjectPlaylist(playlist: Playlist) {
    this.currentPlaylistSubject.next(playlist);
  }

  loadPlaylists(): Observable<any>{
    const url = `${this.apiUrl}/loadPlaylists`;
    return this.http.get<PlaylistsResponse>(url).pipe(
      tap(response => {
        if (response.success){
          this.playlistsSubject.next(response.playlists);
          console.log("Message", this.playlistsSubject.getValue);
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

            // Agregar la nueva playlist al estado local
            const updatedPlaylists = [...this.currentPlaylists, currentplaylist];
            this.playlistsSubject.next(updatedPlaylists);
            console.log(updatedPlaylists);
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
          console.log(response);
          let updatedPlaylist: Playlist | null = null;
          
          // Actualizar la playlist en el array
          const updatedPlaylists = this.currentPlaylists.map(playlist => {
            if (playlist._id === playlistId){
              updatedPlaylist = {...playlist, tracks: [...playlist.tracks, track]};
              return updatedPlaylist;
            } else {
              return playlist;
            }
          });
          
          // Actualizar ambos subjects
          console.log(updatedPlaylists);
          this.playlistsSubject.next(updatedPlaylists);
          
          // Actualizar currentPlaylist con la versión actualizada
          if (updatedPlaylist) {
            this.currentPlaylistSubject.next(updatedPlaylist);
          }
        }
      })
    )
  }

  //Actualizar playlist existente
  updatePlaylist(playlistId: string, playlistData: Playlist): Observable<PlaylistsResponse> {
    
    return this.http.put<PlaylistsResponse>(`${this.apiUrl}/updatePlaylist`, {playlistData})
      .pipe(
        tap(response => {
          console.log(response);
          if (response.success) {
            // Actualizar la playlist en el estado local
            console.log("Status : ",response.playlist);
            const updatedPlaylists = this.currentPlaylists.map(playlist => 
              playlist._id === playlistId ? playlistData : playlist
            );
            this.playlistsSubject.next(updatedPlaylists);
            
            // Actualizar la playlist actual si es la que se está editando
            if (this.currentPlaylistSubject.value?._id === playlistId) {
              this.currentPlaylistSubject.next(response.playlist);
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  //Eliminar playlist
  deletePlaylist(playlistData: Playlist): Observable<deletedResponse> {
    console.log(this.playlists$.subscribe);
    console.log(playlistData);
    return this.http.delete<deletedResponse>(`${this.apiUrl}/deletePlaylist`, {body: playlistData, responseType : 'json'})
        .pipe(
          tap(response => {
            if (response) {
            // Eliminar la playlist del estado local
            const updatedPlaylists = this.currentPlaylists.filter(playlist => playlist._id !== playlistData._id);
            this.playlistsSubject.next(updatedPlaylists);
            console.log(playlistData._id + " has been deleted successfully")
            // Limpiar la playlist actual si es la que se eliminó
            if (this.currentPlaylistSubject.value?._id === playlistData._id) {
              this.currentPlaylistSubject.next(null);
            }
          }
        }),
        catchError(this.handleError)
      );
      
  }
  private handleError(error: HttpErrorResponse) {
    console.log("tirando el error que viene del servidor :", error.error.message);
    //  throwError(() => error.error.message || 'Unexpected error');
     return throwError(() => error.error.message) ;
  }

   removeTrack(track: any, playlistId : string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${track.id}/removeTrack`, {body : {playlistId}}).pipe(
      tap(response => {
        if(response.success){
          let updatedPlaylist: Playlist | null = null;
          const updatedPlaylists = this.currentPlaylists.map(playlist => {
            if (playlist._id === playlistId){
              const tempTracks = playlist.tracks.filter( item => item.id != track.id)
              updatedPlaylist = {...playlist, tracks: [...tempTracks]};
              return updatedPlaylist;
            } else {
              return playlist;
            }

          });
          this.playlistsSubject.next(updatedPlaylists);
          this.currentPlaylistSubject.next(updatedPlaylist);
        }
      })
    )
  }
  
}
