import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SpotifyAPIService } from '../../../services/spotify-api.service';
import { FormControl, ReactiveFormsModule , FormsModule, Validators } from '@angular/forms';
import { response } from 'express';
import { CommonModule } from '@angular/common'; 
import { SharedDataService } from '../../../services/shared-data.service';


@Component({
  selector: 'app-artist-search',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './artist-search.component.html',
  styleUrl: './artist-search.component.css'
})
export class ArtistSearchComponent implements OnInit{
  ngOnInit(): void {
    // Observa reactivamente los cambios en la Signal y actualiza la variable
    

  }
    artistName = new FormControl('', [Validators.required, Validators.minLength(1)]);

    @Output() artistsEmmiter = new EventEmitter<any>();
    responseSearch:any= null;
    artist:any = null;
    allMatches:any[] = [];
    artistsSignals!: any[];
    @Input() artists:any[] = [];
    
    
    
    constructor(
      private spotifyService:SpotifyAPIService,
      private sharedDataService:SharedDataService,
      ) {}

  
    buscarArtista(): void {
      if(this.artistName.invalid && this.artistName.touched){return;}
      console.log(this.artistName.invalid);
      this.spotifyService.searchArtists(this.artistName.value!).subscribe(response => {
      this.responseSearch = response.artists.items.length > 1 ? response.artists.items[0] : false ;
      this.allMatches = response.artists.items;
      console.log("Artista",response.artists.items,"  Search: ", this.responseSearch);}
    )}
    
    addArtistToList(artist:any = this.responseSearch): void {
      console.log("agreagndo artista: ",artist, "Que hay en artists: ", this.artists);
      if( !this.artists.some(item => item.name === artist.name)){
        this.artistsEmmiter.emit(artist);
        this.sharedDataService.updateArtists(artist);
        this.artists.push(artist);
        localStorage.setItem("artists", JSON.stringify({data : this.artists, expiry:Date.now()+ 24*60*60*1000}));
        console.log("add " ,localStorage.getItem("artists"));
      }
      
    }

}


