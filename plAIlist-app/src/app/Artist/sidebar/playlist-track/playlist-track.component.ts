import { Component, inject, Input } from '@angular/core';
import { DurationPipe } from "../../../pipes/duration.pipes";
import { SavePlaylistService } from '../../../services/save-playlist-service.service';
import { response } from 'express';

@Component({
  selector: 'app-playlist-track',
  imports: [DurationPipe],
  templateUrl: './playlist-track.component.html',
  styleUrl: './playlist-track.component.css'
})
export class PlaylistTrackComponent {
  @Input() tracks: any[] = [];
  @Input() playlistId : string = "";
  playlistServices : SavePlaylistService = inject(SavePlaylistService);
removeTrack( track: any) {
  console.log(this.playlistId);
  this.playlistServices.removeTrack(track,this.playlistId).subscribe({
    next : (response)=>{
      if(response.success){
        return 
      }
    }
  })
}

  
  

  

}
