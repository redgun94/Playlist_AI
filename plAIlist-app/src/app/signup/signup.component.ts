import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../models/auth.model';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  showPassword = false;
  showConfirmPassword = false;
  passwordStrengthCat : string = "Fuerte";
  errorMessage: string | null = null; 

  constructor(
    private authService: AuthService, 
    private router: Router,
    private translate: TranslateService
  ) {
    this.translate.get('signup.passwordStrength.strong').subscribe((res: string) => {
      this.passwordStrengthCat = res;
    });
  }

  signupForm = new FormGroup({
    fullName : new FormControl('',[Validators.required,Validators.minLength(3)]),
    email: new FormControl('',[Validators.required,Validators.email]),
    password: new FormControl('',[Validators.required,Validators.minLength(8)]),
    confirmPassword: new FormControl('',[Validators.required]),
    acceptTerms: new FormControl(false,[Validators.requiredTrue])
  })

  get passwordLength(): number{
    return this.signupForm.get("password")?.value?.length || 0;
  }
  get passwordStrength(): string{
    if(this.passwordLength < 8){
      this.translate.get('signup.passwordStrength.weak').subscribe((res: string) => {
        this.passwordStrengthCat = res;
      });
      return "weak";
    } 
    if(this.passwordLength < 12){
      this.translate.get('signup.passwordStrength.medium').subscribe((res: string) => {
        this.passwordStrengthCat = res;
      });
      return "medium";
    } 
    this.translate.get('signup.passwordStrength.strong').subscribe((res: string) => {
      this.passwordStrengthCat = res;
    });
    return "strong"; 
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatch(): boolean {
    const password = this.signupForm.get('password')?.value;
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    if (!this.passwordsMatch()) {
      return;
    }
    
    const userData = this.signupForm.value as RegisterRequest;
    this.authService.register(userData).subscribe({
      next: (response) => { 
        if(response.success){
          this.errorMessage = null;
          this.router.navigate(['/dashboard']);
        }
    },
      error: (err) => {
        this.errorMessage = err.message;
      }
    })
  }
}