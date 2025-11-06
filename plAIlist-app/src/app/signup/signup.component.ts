import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../models/auth.model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  showPassword = false;
  showConfirmPassword = false;
  passwordStrengthCat : string = "Fuerte";
  errorMessage: string | null = null; 

  constructor(private authService: AuthService, private router: Router){
 

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
      this.passwordStrengthCat = "Débil";
      return "weak";
    } 
    if(this.passwordLength < 12){
      this.passwordStrengthCat = "Media";
      return "medium";
    } 
    this.passwordStrengthCat = "Fuerte";
    return "strong"; 
  }

 togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
    console.log(typeof(this.signupForm.get('confirmPassword')?.value));
    console.log(this.signupForm.get('confirmPassword')?.value?.length);

  }

  passwordsMatch(): boolean {
    const password = this.signupForm.get('password')?.value;
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onSubmit(): void {
    console.log('🎯 onSubmit() EJECUTADO!');
    
    if (this.signupForm.invalid) {
      console.log('❌ Formulario inválido');
      this.signupForm.markAllAsTouched();
      return;
    }

    if (!this.passwordsMatch()) {
      console.log('❌ Las contraseñas no coinciden');
      return;
    }

    console.log('✅ Formulario válido!');
    console.log('📝 Datos:', this.signupForm.value);
    
    // Aquí llamarías a tu AuthService
    const userData = this.signupForm.value as RegisterRequest;
    this.authService.register(userData).subscribe({
      next: (response) => { 
        if(response.success){
          this.errorMessage = null;
          console.log("Welcome: ",response.user.fullName);
          this.router.navigate(['/home']);

        }
    },
      error: (err) => {
        this.errorMessage = err.message;
        console.error(this.errorMessage);
      }
    
    })

  }
}
