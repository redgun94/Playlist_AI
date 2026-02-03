import { Component, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpotifyAPIService } from '../../services/spotify-api.service';
import { firstValueFrom } from 'rxjs';
import { DurationPipe } from '../../pipes/duration.pipes';
import { SavePlaylistService } from '../../services/save-playlist-service.service';
import { Playlist } from '../../models/playlist.models';


@Component({
  selector: 'app-artist-panel',
  imports: [TranslateModule, CommonModule, DurationPipe],
  templateUrl: './artist-panel.component.html',
  styleUrl: './artist-panel.component.css'
})
export class ArtistPanelComponent implements OnInit{


@Input() artistDetail:any;
  spotifyAPIService:SpotifyAPIService = inject(SpotifyAPIService);
  loadPlaylistsService: SavePlaylistService = inject(SavePlaylistService);
  songs: any[] = [];
  albums: any;
  activeView: any;
  viewPlaylistList:boolean =  false;
  playlistList : any[] | undefined
  selectedTrack: any = null; 

constructor( private translate: TranslateService){
}
  async ngOnInit(): Promise<void>{
  if(this.artistDetail){
    this.artistDetail = this.artistDetail;
    this.songs = await this.getSongsByArtist(this.artistDetail?.name);
    this.albums = await this.getAlbumsByArtist(this.artistDetail?.id);
    this.activeView = 1;
    this.loadPlaylistsService.playlists$.subscribe(value=>this.playlistList = value);

    console.log( "albums: "+ this.albums );
  }
  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['artistDetail'] && changes['artistDetail'].currentValue) {
        // El artista ha cambiado (ej. el usuario hizo clic en otro artista)
        // Puedes disparar llamadas a API aquí si fuera necesario
      this.artistDetail = changes['artistDetail'].currentValue;
      this.songs = await this.getSongsByArtist(this.artistDetail.name);
      this.albums = await this.getAlbumsByArtist(this.artistDetail.id);


    }}
  
    private async getSongsByArtist(artist: String): Promise<any[]> {
      const response: any = await firstValueFrom(
        this.spotifyAPIService.getSongsByArtist(this.artistDetail.name)
      );
      console.log("Songs",response.tracks.items);
      return response.tracks.items;
    }

    private async getAlbumsByArtist( artistDetail : string): Promise<any[]>{
      const response: any = await firstValueFrom(
        this.spotifyAPIService.getAlbumsByArtist(this.artistDetail?.id));
        console.log(response.items);
        return response.items;
    }

    viewAlbums(id: number) {
      this.activeView = id;
      console.log(id);
    }
    addTrackToPlaylistDialog(song: any) {
      this.selectedTrack = song;
      this.viewPlaylistList = true;
      console.log(song);
    }

    closePlaylistDialog() {
      this.viewPlaylistList = false;
      this.selectedTrack = null;
    }
    addTrackToPlaylist(playlist: Playlist) {
      if (this.selectedTrack && playlist) {
        console.log("Track:", this.selectedTrack.name);
        console.log("Added Successfully to:", playlist.playlistName);
        // this.loadPlaylistsService.addTrackToPlaylist(this.selectedTrack, playlist);
        this.loadPlaylistsService.addTrackToPlaylist(playlist._id,this.selectedTrack).subscribe({
          next: (response) => {
            if(response.success){
              console.log(response);
            }
          },
          error: (error) => {
            console.error(error);
            }
        });
        // Cierra el diálogo después de agregar
        this.closePlaylistDialog();
      }
    }
    addToPlaylist() {
    throw new Error('Method not implemented.');
    }

}