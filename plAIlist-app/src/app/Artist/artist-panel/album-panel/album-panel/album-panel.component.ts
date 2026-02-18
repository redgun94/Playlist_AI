import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { SpotifyAPIService } from '../../../../services/spotify-api.service';

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
  items: any[] =[];

  constructor( ){
  }
  ngOnInit(){
      const album = this.loadAlbun.getTracksByAlbums(this.albumSelected.id).subscribe(response => {
        console.log(response);
        this.items =[...response.items];
        console.log(this.items);
    });
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

}
