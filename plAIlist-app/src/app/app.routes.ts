import { Routes } from '@angular/router';
import { HomeComponent } from './nav/home/home.component';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login/login.component';
import { SignupComponent } from './signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';


export const routes: Routes = [
    {path: '', component: LandingComponent},  // Ruta raíz muestra landing
    {path: 'landing', component: LandingComponent},  // Ruta explícita para landing
    {
        path: 'home', 
        component: HomeComponent,
        canActivate : [authGuard]
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [noAuthGuard]
    },
    {
        path: 'signup', 
        component: SignupComponent,
        canActivate: [noAuthGuard]
    },
    { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {path: '**', redirectTo: '', pathMatch: 'full'}  // Wildcard SIEMPRE al final
];
