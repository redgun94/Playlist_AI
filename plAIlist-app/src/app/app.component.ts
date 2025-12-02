import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/header/header.component";
import { FormComponent } from './form/form.component';
import { SpotifyAPIService } from './services/spotify-api.service';
import { ArtistSearchComponent } from "./nav/home/artist-search/artist-search.component";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'plAIlist-app';
  currentLanguage: string = 'es';
  
  constructor(private translate: TranslateService) {
    // Establecer el idioma por defecto y luego el idioma actual
    // En v17, necesitamos establecer ambos
    this.translate.setDefaultLang('en');
    this.translate.use(this.currentLanguage).subscribe({
      next: (translations) => {
        console.log('✅ Idioma configurado en AppComponent:', this.currentLanguage);
        console.log('✅ Traducciones cargadas:', Object.keys(translations || {}).length, 'claves');
      },
      error: (error) => {
        console.error('❌ Error al configurar idioma:', error);
        console.error('Verifica que el archivo /assets/i18n/es.json exista y sea accesible');
      }
    });
  }
}
