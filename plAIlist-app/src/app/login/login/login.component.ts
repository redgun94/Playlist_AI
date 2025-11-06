import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginRequest } from '../../models/auth.model';
import { response } from 'express';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private authService : AuthService, private route : Router ){

  }

  loginForm = new FormGroup({
    userName: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required, Validators.minLength(8)]),
  });
onSubmit(){

  if(this.loginForm.invalid){
    alert("Data Invalid or Incorrect");
    this.loginForm.markAsTouched;
    return;
  }
  const isUserActive = this.authService.isAuthenticated();
  if(isUserActive){
    this.route.navigate(['/home']);
  }

  const userDataLogin = this.loginForm.value as LoginRequest;
  this.authService.login(userDataLogin).subscribe({
    next: response => {
      if(response.success){
        console.log("Welcome:",response.user.fullName);
        this.route.navigate(['/home']);
      }
    },
    error: err =>{ alert("Error found : " + err.error.message)}
  }
    
  )

}
}
