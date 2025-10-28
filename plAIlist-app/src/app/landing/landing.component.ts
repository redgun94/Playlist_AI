import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  
  hoveredFeature: number | null= null;


  features: Feature[] = [
    {
      icon: 'sparkles',
      title: 'Playlist con IA',
      description: 'Crea playlists perfectas usando inteligencia artificial basada en tus artistas favoritos'
    },
    {
      icon: 'list',
      title: 'Selección Manual',
      description: 'Toma control total y crea playlists manualmente seleccionando cada canción'
    },
    {
      icon: 'user',
      title: 'Perfil Personal',
      description: 'Guarda todas tus playlists en tu perfil y accede a ellas cuando quieras'
    },
    {
      icon: 'download',
      title: 'Exporta a Spotify',
      description: 'Exporta tus playlists directamente a tu cuenta de Spotify con un solo click'
    }
  ];

  constructor(private router : Router){}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  onFeatureHover(index: number): void {
    this.hoveredFeature = index;
  }

  onFeatureLeave(): void {
    this.hoveredFeature = null;
  }

}
