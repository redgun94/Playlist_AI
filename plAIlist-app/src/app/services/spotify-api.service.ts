import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { Playlist } from '../models/playlist.models';

interface SpotifyAuthResponse {
  success: boolean;
  message: string;
  userAuthenticated: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class SpotifyAPIService {


  private clientId:string = "c74e5ceefe234e1995a0df05e9991948";
  private clientSecret:string = "a52a61c5919843b6bbacd03bde74c823";
  private url = 'http://localhost:3000/api/spotifySer';
  private urlA = 'http://localhost:3000/api/auth';
  private token: string = "";

  
  constructor(private httpRqst: HttpClient) {

   };

   getStringToken(){
    return this.token;
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
