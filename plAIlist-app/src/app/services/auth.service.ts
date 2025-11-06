import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';;
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { RegisterRequest, LoginRequest, AuthResponse, User } from '../models/auth.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';

    // BehaviorSubject para mantener el estado del usuario actual
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
  const storedUser = localStorage.getItem('currentUser');
  this.currentUserSubject = new BehaviorSubject<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );
  this.currentUser = this.currentUserSubject.asObservable();
}

 // Getter para obtener el valor actual del usuario
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Método para registrar un nuevo usuario
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          // Si el registro es exitoso, guardar token y usuario
          if (response.success && response.token) {
            this.saveAuthData(response.token, response.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse>{
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Si el login es exitoso, guardar token y usuario
        if( response.success && response.token){
          this.saveAuthData(response.token, response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void{
    //limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    //Limpiar el BehaviorSubject
    this.currentUserSubject.next(null);
  }

  //Metodo para verificar si el usuario esta autenticado
  isAuthenticated():boolean{
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken():string | null {
    return localStorage.getItem('token');
  }

  private saveAuthData(token: string, user:User):void{
    localStorage.setItem('token',token);
    localStorage.setItem('current',JSON.stringify(user));

    //Actualizar el behaviorSubject
    this.currentUserSubject.next(user);
  }
  private handleError(error: HttpErrorResponse) {
  let errorMessage = 'Ocurrió un error desconocido';
  
  if (error.error instanceof ErrorEvent) {
    errorMessage = `Error: ${error.error.message}`;
  } else {
    errorMessage = error.error?.message || `Código de error: ${error.status}`;
  }
  
  console.error('Error en AuthService:', errorMessage);
  return throwError(() => new Error(errorMessage));
}
}
