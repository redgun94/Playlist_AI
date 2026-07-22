import { Component, inject, Input } from '@angular/core';
import { DurationPipe } from "../../../pipes/duration.pipes";
import { SavePlaylistService } from '../../../services/save-playlist-service.service';
import { PlaybackService } from '../../../services/playback.service';
import { firstValueFrom } from 'rxjs';

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
  playbackService : PlaybackService = inject(PlaybackService);
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

async playTrack(track: any) {
  if (!track.uri) {
    return;
  }
  try {
    await this.playbackService.play([track.uri]);
  } catch {
    const sdkErr = await firstValueFrom(this.playbackService.sdkError$);
    alert(sdkErr || 'No se pudo iniciar la reproducción. Verifica que tu cuenta de Spotify sea Premium y esté conectada.');
  }
}

  
  

  

}
