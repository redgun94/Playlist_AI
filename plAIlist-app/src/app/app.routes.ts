import { Routes } from '@angular/router';
import { HomeComponent } from './nav/home/home.component';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login/login.component';
import { SignupComponent } from './sigup/signup/signup.component';


export const routes: Routes = [
    {path: '', component: LandingComponent},  // Ruta raíz muestra landing
    {path: 'landing', component: LandingComponent},  // Ruta explícita para landing
    {path: 'home', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent},
    {path: '**', redirectTo: '', pathMatch: 'full'}  // Wildcard SIEMPRE al final
];
