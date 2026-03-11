import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { response } from 'express';


@Injectable({
  providedIn: 'root'
})
export class SpotifyAPIService {


  private clientId:string = "c74e5ceefe234e1995a0df05e9991948";
  private clientSecret:string = "a52a61c5919843b6bbacd03bde74c823";
  private url = 'http://localhost:3000/api/spotifySer';
  private token: string = "";

  
  constructor(private httpRqst: HttpClient) {
    this.getToken();
   };

   getStringToken(){
    return this.token;
   }
   searchTracks(searchQuery: string): Observable<any> {
    throw new Error('Method not implemented.');
  }

  //  private getToken(){
      
  //     const headers = new HttpHeaders({
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //       'Authorization': 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`)

  //     })
  //     const body = 'grant_type=client_credentials';
  //     this.httpRqst.post<any>(this.url, body, { headers }).subscribe(
  //       response =>{
  //         this.token = response.access_token; 
  //       }
  //     );
  //  }
   private getToken() {
    const body = 'grant_type=client_credentials' +
                 `&client_id=${this.clientId}` +
                 `&client_secret=${this.clientSecret}`;

    const headers = new HttpHeaders({ 
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    this.httpRqst.post<any>(this.url, body, { headers }).subscribe(
      response => {
        this.token = response.access_token;
        console.log('Token recibido:', this.token);
      },
      error => {
        console.error('Error obteniendo el token', error);
      }
    );
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
}

