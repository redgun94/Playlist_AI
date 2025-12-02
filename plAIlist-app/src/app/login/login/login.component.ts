import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginRequest } from '../../models/auth.model';
import { response } from 'express';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
onFocus: any;

  constructor(private authService : AuthService, private route : Router ){
  }

  loginForm = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required, Validators.minLength(8)]),
  });

onSubmit(){
console.log(this.loginForm.get("email")?.errors?.['email']);

  if(this.loginForm.invalid){
    alert("Data Invalid or Incorrect");
    this.loginForm.markAsTouched;
    return;
  }
  const isUserActive = this.authService.isAuthenticated();
  if(isUserActive){
    console.log(this.loginForm.invalid)
    this.route.navigate(['/dashboard']);
  }

  const userDataLogin = this.loginForm.value as LoginRequest;
  this.authService.login(userDataLogin).subscribe({
    next: response => {
      if(response.success){
        console.log("Welcome:",response.user.fullName);
        this.route.navigate(['/dashboard']);
      }
    },
    error: err =>{ alert("Error found : " + err.error.message)}
  }
    
  )

}
}
