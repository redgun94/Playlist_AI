import { Routes } from '@angular/router';
import { HomeComponent } from './nav/home/home.component';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login/login.component';
import { SignupComponent } from './signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthComponent } from './auth/auth/auth.component';


export const routes: Routes = [
    {path: '', component: LandingComponent},
    {path: 'landing', component: LandingComponent},
    {
        path: 'home', 
        component: HomeComponent,
        canActivate : [authGuard]
    },
    // Spanish routes
    {
        path: 'iniciar-sesion',
        component: LoginComponent,
        canActivate: [noAuthGuard]
    },
    {
        path: 'registro', 
        component: SignupComponent,
        canActivate: [noAuthGuard]
    },
    // English routes
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
       // canActivate: [authGuard]
    },
    {
        path:'auth/callback',
        component: AuthComponent,
    },
    {path: '**', redirectTo: '', pathMatch: 'full'}
];
