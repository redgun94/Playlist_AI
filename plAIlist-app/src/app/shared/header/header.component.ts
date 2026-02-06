import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [RouterModule, FormsModule],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentLanguage: string = 'es';
  currentUser: any = null;
  mobileMenuOpen: boolean = false;

  constructor() {}

  ngOnInit() {
    // Cargar idioma guardado
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }

    // Cargar usuario actual
    const userObject = localStorage.getItem('currentUser');
    if (userObject) {
      this.currentUser = JSON.parse(userObject);
    }
  }

  changeLanguage(language: string) {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    // Aquí podrías agregar lógica para recargar la traducción
    window.location.reload();
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUser = null;
    // Redirigir a login o home
    window.location.href = '/login';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
