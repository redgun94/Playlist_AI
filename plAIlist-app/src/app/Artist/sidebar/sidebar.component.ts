import { Component } from '@angular/core';
import { SavePlaylistService } from '../../services/save-playlist-service.service';
import { Playlist } from '../../models/playlist.models';
import { User } from '../../models/auth.model';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

newPlaylistclicked : boolean = false;

onSubmit() {
throw new Error('Method not implemented.');
}
newPlaylist() {
  this.newPlaylistclicked = !this.newPlaylistclicked;
  console.log(this.newPlaylistclicked);
}
  playlist: Playlist[] = [];
  currentPlaylist : Playlist | null = null;
  currentUser!: User;

  constructor(private playlistService: SavePlaylistService){
    const userObject : string = localStorage.getItem("currentUser")!;
    this.currentUser = JSON.parse(userObject);
  }

  createPlaylistForm = new FormGroup({
    playlistName : new FormControl('',[Validators.required, Validators.minLength(3)]),
    playlistDescription : new FormControl('')
  })

  ngOniti(){
    //subscribirse a cambios en playlists
    this.playlistService.playlists$.subscribe(playlist => {
      this.playlist = playlist;
    });
    //subscribirse a la playlist actual
    this.playlistService.currentPlaylist$.subscribe(playlist => {
      this.currentPlaylist = playlist;
    })
  }
  onCreatePlaylist() {
    const newPlaylist: Playlist = {
      // Adjust property names according to Playlist model
      playlistName: "Unknow",
      id: '', // You'll likely need to generate or leave blank depending on model
      tracks: [],
      memoDescription: "Optional",
      userId: this.currentUser.id
    };

    this.playlistService.createPlaylist(newPlaylist).subscribe({
      next: (response) => {
        console.log('✅ Playlist creada:', response.playlist);
        // El estado ya se actualizó automáticamente en el servicio
        // No necesitas hacer nada más aquí
      },
      error: (error) => {
        console.error('❌ Error:', error);
      }
    });
  }
  
  onAddTrack(track: any) {
    if (this.currentPlaylist) {
      this.playlistService.addTrackToPlaylist(this.currentPlaylist.id, track)
        .subscribe({
          next: () => console.log('✅ Canción agregada'),
          error: (err) => console.error('❌ Error:', err)
        });
    }
  }

}
