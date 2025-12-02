import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { response } from 'express';


@Injectable({
  providedIn: 'root'
})
export class SpotifyAPIService {

  private clientId:string = "c74e5ceefe234e1995a0df05e9991948";
  private clientSecret:string = "a52a61c5919843b6bbacd03bde74c823";
  private url = 'https://accounts.spotify.com/api/token';
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
    console.log("Hola",this.token);
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=4`;
    const headers = new HttpHeaders({
      'Authorization': (`Bearer ${this.token}`)
    });

    return this.httpRqst.get(url, { headers });
  }

  //Metodo para buscar canciones por artista
  getSongsByArtist(artist: string){
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=track&limit=10`;
    const headers = new HttpHeaders({
      'Authorization': (`Bearer ${this.token}`)
    });
    return this.httpRqst.get(url, { headers });
  }
}

