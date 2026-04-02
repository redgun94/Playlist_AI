import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.verifySession().pipe(
    map((authenticated: any) => {
      if (authenticated) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};
