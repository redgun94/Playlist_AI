import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';


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
    // this.authService.signup(this.signupForm.value).subscribe(...)
  }
}
