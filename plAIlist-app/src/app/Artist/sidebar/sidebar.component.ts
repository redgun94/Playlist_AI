import { Component, inject, OnChanges, SimpleChanges } from '@angular/core';
import { SavePlaylistService } from '../../services/save-playlist-service.service';
import { Playlist } from '../../models/playlist.models';
import { User } from '../../models/auth.model';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from "@angular/forms";
import { OnInit } from '@angular/core';
import { PlaylistTrackComponent } from "./playlist-track/playlist-track.component";
import { SpotifyAPIService } from '../../services/spotify-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule, ReactiveFormsModule, PlaylistTrackComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{


  newPlaylistclicked : boolean = false;
  errorfound: boolean = false;
  editingPlaylist: Playlist | null = null;
  playlists: Playlist[] = [];
  noPlaylistsMessage: boolean = false;
  currentPlaylist : Playlist | null = null;
  currentUser: User | null = null;
  playlistSelected: boolean = false;
  spotifyServices : SpotifyAPIService = inject(SpotifyAPIService);
  loading: boolean = false;
  showSuccess: boolean = false;
  exportingPlaylistName: string = '';


  constructor(private playlistService: SavePlaylistService, private authService: AuthService){
    this.currentUser = this.authService.currentUserValue;
  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   this.playlistService.playlists$.subscribe(value => {
  //     this.playlists = value;
  //   });
  
  //   //subscribirse a la playlist actual
  //   this.playlistService.currentPlaylist$.subscribe(playlist => {
  //     this.currentPlaylist = playlist;

  //   })
  // }

onSubmit() {
  if(this.editingPlaylist)
  {return this.onUpdatePlaylist();}
  this.onCreatePlaylist();

}
newPlaylist() {
  this.newPlaylistclicked = !this.newPlaylistclicked;
  if (!this.newPlaylistclicked) {
    this.resetForm();
  }
  console.log(this.newPlaylistclicked);
}

closeModal() {
  this.newPlaylistclicked = false;
  this.resetForm();
}

resetForm() {
  this.editingPlaylist = null;
  this.createPlaylistForm.reset();
  this.errorfound = false;
}


  createPlaylistForm = new FormGroup({
    playlistName : new FormControl('',[Validators.required, Validators.minLength(3)]),
    playlistDescription : new FormControl('')
  })

  ngOnInit(){
    //subscribirse a cambios en playlists 
    this.playlistService.playlists$.subscribe(value => {
      this.playlists = value;
      this.noPlaylistsMessage = value.length === 0;
    });
  
    //subscribirse a la playlist actual
    this.playlistService.currentPlaylist$.subscribe(playlist => {
      this.currentPlaylist = playlist;

    })
  }

  onCreatePlaylist() {
    const newPlaylist: Playlist = {
      playlistName: this.createPlaylistForm.value.playlistName ?? '',
      _id: '', // You'll likely need to generate or leave blank depending on model
      tracks: [],
      memoDescription: this.createPlaylistForm.value.playlistDescription ?? "Optional",
      userId: this.currentUser?.id
    };

    this.playlistService.createPlaylist(newPlaylist).subscribe({
      next: (response) => {
        console.log('✅ Playlist creada:', response.playlist);
        // El estado ya se actualizó automáticamente en el servicio
        this.closeModal();
      },
      error: (error) => {
        this.errorfound = true;
        console.error('❌ Error:', error);
      }
    });
  }
  
editPlaylist(playlist: Playlist) {
    console.log(playlist);
    this.editingPlaylist = playlist;
    this.createPlaylistForm.patchValue({
      playlistName: playlist.playlistName,
      playlistDescription: playlist.memoDescription || "" });
    this.newPlaylistclicked = true;
  }

  onUpdatePlaylist() {
    if (!this.editingPlaylist) return;

    const updatedPlaylist: Playlist = {
      ...this.editingPlaylist,
      playlistName: this.createPlaylistForm.value.playlistName ?? this.editingPlaylist.playlistName,
      memoDescription: this.createPlaylistForm.value.playlistDescription ?? this.editingPlaylist.memoDescription
    };

    this.playlistService.updatePlaylist(this.editingPlaylist._id, updatedPlaylist).subscribe({
      next: (response) => {
        console.log('✅ Playlist actualizada:', response.message);
        this.closeModal();
      },
      error: (error) => {
        this.errorfound = true;
        console.error('❌ Error updating playlist:', error);
      }
    });
  }

  deletePlaylist(playlist: Playlist) {
    if (confirm(`Are you sure you want to delete "${playlist.playlistName}"?`)) {
      this.playlistService.deletePlaylist(playlist).subscribe({
        next: (response) => {
          console.log('✅ Playlist eliminada:', response);
          // El estado ya se actualizó automáticamente en el servicio
        },
        error: (error) => {
          console.error('❌ Error deleting playlist:', error);
        }
      });
    }
  }

  onAddTrack(track: any) {
    if (this.currentPlaylist) {
      this.playlistService.addTrackToPlaylist(this.currentPlaylist._id, track)
        .subscribe({
          next: () => console.log('✅ Canción agregada'),
          error: (err) => console.error('❌ Error:', err)
        });
    }
  }

  playlistClicked(playlist: Playlist) {
    console.log(playlist.tracks);
    if(playlist == this.currentPlaylist && this.playlistSelected){
      this.playlistSelected = false;
    }else{
      this.playlistSelected = true;
      this.playlistService.currentSubjectPlaylist = playlist;
    }
  }

  exportPlaylistToSpotify(playlist: Playlist) {
    console.log("entrando a exportar");
    this.loading = true;
    this.exportingPlaylistName = playlist.playlistName;
    this.spotifyServices.exportPlaylistToSpotify(playlist).subscribe({
      next: (res) => {
        console.log("Playlist exportada :", res);
        this.loading = false;
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
          this.exportingPlaylistName = '';
        }, 3000);
      },
      error: (error) => {
        console.log('Error al exportar :', error);
        this.loading = false;
        this.exportingPlaylistName = '';
      }
    });
  }
}