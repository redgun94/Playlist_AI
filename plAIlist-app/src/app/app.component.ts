import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/header/header.component";
import { FormComponent } from './form/form.component';
import { SpotifyAPIService } from './services/spotify-api.service';
import { ArtistSearchComponent } from "./nav/home/artist-search/artist-search.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'plAIlist-app';
}
