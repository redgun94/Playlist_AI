import { Component, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
   authService = inject(AuthService);
   router = inject(Router);
   platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('userId');
    console.log(token);
    if (token) {
      // Decodifica el payload del JWT para sacar el usuario
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      this.authService.saveAuthData(token, {
        id: payload.userId,
        email: payload.email,
        fullName: payload.fullName,
      });
  
      window.history.replaceState({}, document.title, '/dashboard');
      this.router.navigate(['/dashboard']);
    }
  }
}
