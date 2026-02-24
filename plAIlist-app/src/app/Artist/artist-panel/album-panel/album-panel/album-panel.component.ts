import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { SpotifyAPIService } from '../../../../services/spotify-api.service';
import { ArtistPanelComponent } from '../../artist-panel.component';
import { Playlist } from '../../../../models/playlist.models';
import { SavePlaylistService } from '../../../../services/save-playlist-service.service';

@Component({
  selector: 'app-album-panel',
  imports: [],
  templateUrl: './album-panel.component.html',
  styleUrl: './album-panel.component.css'
})
export class AlbumPanelComponent {





  @Input() albumSelected : any;
  @Output() goBackEvent = new EventEmitter<void>();
  loadAlbun: SpotifyAPIService = inject(SpotifyAPIService);
  playlists: SavePlaylistService = inject(SavePlaylistService);
  items: any[] =[];
  showPlaylistMenu = false;
  selectedTrack: any = null;
  playlistsArray: any[] = [];
  addedTrack: boolean = false;
  tExists: boolean = false;
  constructor(){
  }
  ngOnInit(){

      this.playlists.playlists$.subscribe(value => {
        this.playlistsArray = value;
      });
      const album = this.loadAlbun.getTracksByAlbums(this.albumSelected.id).subscribe(response => {
        this.items =[...response.items];
    });
  }
  addTrack(event:Event ,track: any) {
    this.selectedTrack = track;
    event.stopPropagation();
    this.showPlaylistMenu = !this.showPlaylistMenu;
    console.log(this.selectedTrack);
  }
  formatDuration(ms: number): string {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  goBack(): void {
    this.goBackEvent.emit();
  }

  addToPlaylist(playlistId : string, trExists:boolean, track : any) {
    if(trExists){
      this.closePlaylistMenu();
      return;
    }
    this.playlists.addTrackToPlaylist(playlistId ,track).subscribe({
      next : response => {
        if(response){
          this.addedTrack  = true;
          return;
        }
      }
    })
    console.log('Add to playlist:', this.selectedTrack);
  }

  togglePlaylistMenu(event: Event, track: any): void {
    
  }

  closePlaylistMenu(): void {
    this.showPlaylistMenu = false;
    this.selectedTrack = null;
  }
  trackExists(playlist: Playlist, track: any): boolean {
    if (!track || !playlist.tracks) return false;
    return playlist.tracks.some(item => item?.id === track.id);
  }

}
