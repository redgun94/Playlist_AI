import { Component, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpotifyAPIService } from '../../services/spotify-api.service';
import { firstValueFrom } from 'rxjs';
import { DurationPipe } from '../../pipes/duration.pipes';


@Component({
  selector: 'app-artist-panel',
  imports: [TranslateModule, CommonModule, DurationPipe],
  templateUrl: './artist-panel.component.html',
  styleUrl: './artist-panel.component.css'
})
export class ArtistPanelComponent implements OnInit{
@Input() artistDetail:any;
spotifyAPIService:SpotifyAPIService = inject(SpotifyAPIService);
  songs: any;

constructor( private translate: TranslateService){
}
  async ngOnInit(): Promise<void>{
  if(this.artistDetail){
    this.artistDetail = this.artistDetail;
    this.songs = await this.getSongsByArtist(this.artistDetail.name);
    console.log(this.songs);
  }
  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['artistDetail'] && changes['artistDetail'].currentValue) {
        // El artista ha cambiado (ej. el usuario hizo clic en otro artista)
        // Puedes disparar llamadas a API aquí si fuera necesario
      this.artistDetail = changes['artistDetail'].currentValue;
      this.songs = await this.getSongsByArtist(this.artistDetail.name);


    }}
  
    private async getSongsByArtist(artist: String): Promise<any[]> {
      const response: any = await firstValueFrom(
        this.spotifyAPIService.getSongsByArtist(this.artistDetail.name)
      );
      console.log(response.tracks);
      return response.tracks.items;
    }


}