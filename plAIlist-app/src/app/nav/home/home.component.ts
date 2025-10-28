import { Component, Inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistSearchComponent } from "./artist-search/artist-search.component";
import { SpotifyAPIService } from '../../services/spotify-api.service';
import { response } from 'express';
import { SharedDataService } from "../../services/shared-data.service";
import { ArtistPanelComponent } from "../../Artist/artist-panel/artist-panel.component";
import { of } from 'rxjs';




@Component({
  selector: 'app-home',
  imports: [ArtistSearchComponent, ArtistPanelComponent,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit{
  token:String = "";
  artistsSignals!: Signal<any>[];
  artists:any[] = [];
  artist: any;
  selected:boolean = false;

  constructor(
    private spotifyService:SpotifyAPIService,
    private sharedDataService: SharedDataService
  ){};

  ngOnInit(){
    const storageData = JSON.parse(localStorage.getItem('artists') || '{}');

    // Verificar que `storageData` tenga la propiedad `expiry` y que no haya expirado
    if (storageData && storageData.expiry && storageData.expiry > Date.now()) {
      const dataArray = Array.isArray(storageData.data) ? [...storageData.data] : Object.values(storageData.data);
      this.artists =dataArray;
      console.log("Artistas recuperados desde localStorage:", this.artists);
    } else {
      console.warn("Los datos han expirado o no existen. Limpiando almacenamiento...");
      localStorage.removeItem('artists');
      this.artists = [];
    }
    }

  receiveArtists(artist:any){
    this.artists.push(artist);
    console.log(this.artists);
  }

  cleanLocalStorage(){
    localStorage.removeItem('artists');
    this.selected = false;
    this.artists = [];
    console.log("Clean list", this.artists);
  }

  artistDetail(artist:any){
    this.selected = (this.artist == artist && this.selected)? false: true;
    this.artist = artist;
    
  }
  makePlaylist(){
    const songs:any[] = [];
    let tracks = {};
    for(let item of this.artists){
      this.spotifyService.getSongsByArtist(item.name).subscribe( (response:any) => {
        tracks = JSON.parse(JSON.stringify(response.tracks.items));
       
        songs.push(tracks);
      });
      console.log("tracks",songs);

    }
  }
  clearSelection(){
    this.selected = false;
    this.artist = null;
  }
  selectArtist(artist:any){
    this.selected = true;
    this.artist = artist;
  }
}
