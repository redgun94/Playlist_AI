import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SpotifyAPIService } from '../services/spotify-api.service';
import { ArtistPanelComponent } from '../Artist/artist-panel/artist-panel.component';
import { SidebarComponent } from "../Artist/sidebar/sidebar.component";
import { AgenteAiComponent } from "./agente-ai/agente-ai.component";
import { Playlist } from '../models/playlist.models';
import { PlayerBarComponent } from '../shared/player-bar/player-bar.component';

@Component({
  selector: 'app-dashboard',
  imports: [TranslateModule, FormsModule, CommonModule, ArtistPanelComponent, SidebarComponent, AgenteAiComponent, PlayerBarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild(SidebarComponent) sidebarComponent!: SidebarComponent;

  currentLanguage: string = 'es';
  currentUser: any = null;
  searchType: 'artist' | 'track' = 'artist';
  searchQuery: string = '';
  isSearching: boolean = false;
  errorMessage: string | null = null;
  artists: any[] = [];
  tracks: any[] = [];
  private userSubscription?: Subscription;
  private langChangeSubscription?: Subscription;
  title: any;
  static artists: any[];
  selectedArtist: any = null;
  constructor(
    private translate: TranslateService, 
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private spotifyAPIService: SpotifyAPIService,
    private route: ActivatedRoute
  ){
    // El idioma por defecto ya está configurado en app.config.ts
    // Establecer el idioma y esperar a que se carguen las traducciones
    this.translate.use('es').subscribe({
      next: () => {
        console.log('✅ Idioma "es" configurado y traducciones cargadas');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al cargar traducciones para "es":', error);
      }
    });
  }

  ngOnInit(): void {
    // Verificar que las traducciones estén disponibles
    this.langChangeSubscription = this.translate.onLangChange.subscribe((event) => {
      console.log('✅ Idioma cambiado a:', event.lang);
      console.log('✅ Traducciones disponibles:', Object.keys(event.translations).length, 'claves');
      this.cdr.detectChanges();
    });

    
    // Verificar las traducciones disponibles

    
    // Esperar un momento para que las traducciones se carguen

    

    // Obtener el valor actual del usuario
    // currentUserValue es un GETTER, se accede como propiedad (sin paréntesis)
    this.currentUser = this.authService.currentUserValue;
    console.log('currentUser (tipo):', typeof this.currentUser);
    console.log('currentUser (valor):', this.currentUser);

    // Fetch premium status desde el backend (para la estrella)
    this.spotifyAPIService.getPlaybackToken().subscribe({
      next: (res) => {
        console.log('[Dashboard] getPlaybackToken response:', res);
        if (res.isPremium !== undefined) {
          localStorage.setItem('spotifyProduct', res.isPremium ? 'premium' : 'free');
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[Dashboard] getPlaybackToken error:', err)
    });
    
    // Suscribirse a cambios en el usuario
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      console.log('Usuario recibido en suscripción:', user);
      // Asegurarse de que el usuario no sea un string JSON
      if (typeof user === 'string') {
        try {
          this.currentUser = JSON.parse(user);
        } catch (error) {
          console.error('Error al parsear usuario en suscripción:', error);
          this.currentUser = null;
        }
      } else {
        this.currentUser = user;
      }
      // Forzar detección de cambios
      this.cdr.detectChanges();
    });

    // Reintentar exportación pendiente si volvió de autorización Spotify
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.spotifyUserId) {
            localStorage.setItem('spotifyUserId', payload.spotifyUserId);
          }
          if (payload.spotifyEmail) {
            localStorage.setItem('spotifyEmail', payload.spotifyEmail);
          }
          if (payload.spotifyAvatar) {
            localStorage.setItem('spotifyAvatar', payload.spotifyAvatar);
          }
          if (payload.spotifyProduct) {
            localStorage.setItem('spotifyProduct', payload.spotifyProduct);
          }
          this.authService.saveAuthData(token, {
            id: payload.userId || payload._id || payload.spotifyUserId || '',
            fullName: payload.fullName || payload.name || '',
            email: payload.email || payload.spotifyEmail || '',
            picture: payload.picture || payload.spotifyAvatar || undefined
          });
          window.history.replaceState({}, '', '/dashboard');
        } catch (e) {
          console.error('Error decodificando token de Spotify:', e);
        }
      }

      if (params['spotify_connected'] === 'true') {
        const pending = sessionStorage.getItem('pendingSpotifyExport');
        if (pending) {
          try {
            const playlist: Playlist = JSON.parse(pending);
            sessionStorage.removeItem('pendingSpotifyExport');
            this.sidebarComponent?.exportPlaylistToSpotify(playlist);
          } catch {
            sessionStorage.removeItem('pendingSpotifyExport');
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiar las suscripciones cuando el componente se destruya
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  changeLanguage(lang: string){
    this.currentLanguage = lang;
    this.translate.use(lang);
  }

  changeSearchType(type: 'artist' | 'track'){
    this.searchType = type;
    this.clearSearch();
  }
  onSearch() {
    if (this.searchQuery) {
      this.spotifyAPIService.searchArtists(this.searchQuery).subscribe((data) => {
        this.isSearching = false;
        console.log('Artistas encontrados:', data);
        this.artists = data.data.artists.items;
      });
      return;
    }
  
    if (this.searchType === 'track') {
      this.spotifyAPIService.searchTracks(this.searchQuery).subscribe((data) => {
        console.log('Canciones encontradas:', data);
        setTimeout(() => {
          this.isSearching = false;
        }, 1000);
      });
      return;
    }
  }
 

  clearSearch(){
    this.searchQuery = '';
    this.artists = [];
    this.tracks = [];
    this.errorMessage = null;
    this.selectedArtist = null;

  }

  get spotifyConnected(): boolean {
    return !!localStorage.getItem('spotify_token');
  }

  get spotifyEmail(): string | null {
    return localStorage.getItem('spotifyEmail');
  }

  get spotifyUserId(): string | null {
    return localStorage.getItem('spotifyUserId');
  }

  get isSpotifyPremium(): boolean {
    return localStorage.getItem('spotifyProduct') === 'premium';
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['./login']);
  }
  selectArtist(artist:any){
    if(artist === this.selectedArtist){
      this.selectedArtist = null;
      return
    }
    this.selectedArtist = artist;
    //this.isSearching = true;
  }

}
