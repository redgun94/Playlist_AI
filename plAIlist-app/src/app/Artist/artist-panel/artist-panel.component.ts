import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardComponent } from '../../dashboard/dashboard.component';

@Component({
  selector: 'app-artist-panel',
  imports: [TranslateModule, CommonModule],
  templateUrl: './artist-panel.component.html',
  styleUrl: './artist-panel.component.css'
})
export class ArtistPanelComponent implements OnInit{
@Input() artistDetail:any;
artistSpotifyURL:string = "";
followers:number = 0;
genres:string[] = [];
popularity:number = 0;
images:any[] = [];
name:string = "";
id:string = "";
type:string = "";
uri:string = "";

constructor( private translate: TranslateService){
}
ngOnInit(): void{
  if(this.artistDetail){
    this.artistSpotifyURL = this.artistDetail.external_urls.spotify;
    this.followers = this.artistDetail.followers.total;
    this.genres = this.artistDetail.genres;
    this.popularity = this.artistDetail.popularity;
    this.images = this.artistDetail.images;
    this.name = this.artistDetail.name;
    this.id = this.artistDetail.id;
    this.type = this.artistDetail.type;
    this.uri = this.artistDetail.uri;
    console.log(this.artistDetail);
  }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['artistDetail'] && changes['artistDetail'].currentValue) {
        // El artista ha cambiado (ej. el usuario hizo clic en otro artista)
        // Puedes disparar llamadas a API aquí si fuera necesario
        this.artistDetail = changes['artistDetail'].currentValue;
        this.artistSpotifyURL = this.artistDetail.external_urls.spotify;
        this.followers = this.artistDetail.followers.total;
        this.genres = this.artistDetail.genres;
        this.popularity = this.artistDetail.popularity;
        this.images = this.artistDetail.images;
        this.name = this.artistDetail.name;
        this.id = this.artistDetail.id;
    }
    console.log(this.artistDetail);
}
}
