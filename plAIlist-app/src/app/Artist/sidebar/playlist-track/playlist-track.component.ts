import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-playlist-track',
  imports: [],
  templateUrl: './playlist-track.component.html',
  styleUrl: './playlist-track.component.css'
})
export class PlaylistTrackComponent {

  @Input() tracks: any[] = [];
  


}
