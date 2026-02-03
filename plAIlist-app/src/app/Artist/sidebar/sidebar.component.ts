import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { SavePlaylistService } from '../../services/save-playlist-service.service';
import { Playlist } from '../../models/playlist.models';
import { User } from '../../models/auth.model';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from "@angular/forms";
import { OnInit } from '@angular/core';
import { PlaylistTrackComponent } from "./playlist-track/playlist-track.component";

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
  currentPlaylist : Playlist | null = null;
  currentUser!: User;
  playlistSelected: boolean = false;


  constructor(private playlistService: SavePlaylistService){
    const userObject : string = localStorage.getItem("currentUser")!;
    this.currentUser = JSON.parse(userObject);
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
    });
  
    //subscribirse a la playlist actual
    this.playlistService.currentPlaylist$.subscribe(playlist => {
      this.currentPlaylist = playlist;

    })
  }
  ngOnchange(){
    //subscribirse a cambios en playlists 
    this.playlistService.playlists$.subscribe(value => {
      this.playlists = value;
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
      userId: this.currentUser.id
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
}
