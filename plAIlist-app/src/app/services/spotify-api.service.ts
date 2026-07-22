import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/enviroment';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { Playlist } from '../models/playlist.models';

interface SpotifyAuthResponse {
  success: boolean;
  message: string;
  userAuthenticated: boolean;
}

interface SpotifyPlaybackTokenResponse {
  success: boolean;
  userAuthenticated: boolean;
  accessToken?: string;
  isPremium?: boolean;
  needsReauth?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class SpotifyAPIService {


  private clientId:string = "c74e5ceefe234e1995a0df05e9991948";
  private clientSecret:string = "a52a61c5919843b6bbacd03bde74c823";
  private url = `${environment.apiUrl}/api/spotifySer`;
  private urlA = `${environment.apiUrl}/api/auth`;
  private token: string = "";

  
  constructor(private httpRqst: HttpClient) {

   };

   getStringToken(){
    return this.token;
   }

   // Token de Spotify + estado premium para el Web Playback SDK.
   // El interceptor ya agrega el Authorization: Bearer <jwt propio>.
   getPlaybackToken(): Observable<SpotifyPlaybackTokenResponse> {
    const url = `${this.urlA}/spotify/playback-token`;
    return this.httpRqst.get<SpotifyPlaybackTokenResponse>(url);
   }

   getSpotifyLoginUrl(userId: string): string {
    return `${this.urlA}/spotify/login?userId=${userId}`;
   }

   // Inicia la reproducción de una o varias canciones en el device_id del Web Playback SDK.
   startPlayback(deviceId: string, uris: string[]): Observable<void> {
    const url = `${this.url}/play`;
    return this.httpRqst.put<void>(url, { deviceId, uris });
   }
   searchTracks(searchQuery: string): Observable<any> {
    throw new Error('Method not implemented.');
  }



   // Método para buscar artistas
  searchArtists(name:string): Observable<any> {
    const url = `${this.url}/searchArtists`;
    console.log("Pidiendo artistas al backend", name);
    return this.httpRqst.get(url,{params:{q : name}});
  }

  //Metodo para buscar canciones por artista
  getSongsByArtist(artist: string){
    const url = `${this.url}/getTracksByArtist`;
    console.log(artist);
    return this.httpRqst.get(url, { params: {q : artist}});
  }

  getAlbumsByArtist(artistId : string){
    const url =  `${this.url}/getAlbumsByArtist`;

      return this.httpRqst.get(url, { params: {id:artistId} });
  }

  getTracksByAlbums(id: string ):Observable<any>{
    const url = `${this.url}/getTracksByAlbums`;

      return this.httpRqst.get(url,{params : { id : id}});
  }

  exportPlaylistToSpotify(playlist:Playlist):Observable<any>{
    console.log(playlist);
    const userId = playlist.userId;
    console.log('UserId para exportar:', userId);
    
    const url = `${this.urlA}/getUserSpotify`;
    const urlPlay = `${this.url}/exportPlaylist`;
    const body = {
      userId: userId,
      playlistName: playlist.playlistName,
      tracks: playlist.tracks,
    };

    return this.httpRqst.get<SpotifyAuthResponse>(url, { params: { q: userId || '' } }).pipe(
      switchMap((user) => {
        console.log(user);
        if (!user.userAuthenticated) {
          const playlistWithUserId = { ...playlist, userId };
          sessionStorage.setItem('pendingSpotifyExport', JSON.stringify(playlistWithUserId));
          window.location.href = `${this.urlA}/spotify/login?userId=${userId}`;
          return of(null);
        }

        return this.httpRqst.post<any>(urlPlay, body);
      })
    );
}
}
