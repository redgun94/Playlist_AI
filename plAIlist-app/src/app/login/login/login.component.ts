import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../../models/auth.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  onFocus: any;

  constructor(
    private authService: AuthService, 
    private route: Router,
    private translate: TranslateService
  ) {}

  loginForm = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required, Validators.minLength(8)]),
  });

onSubmit(){
  if(this.loginForm.invalid){
    this.loginForm.markAsTouched;
    return;
  }
  const isUserActive = this.authService.isAuthenticated();
  if(isUserActive){
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
  })

}
}