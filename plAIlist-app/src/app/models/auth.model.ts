
// Datos que se envían al registrar
export interface RegisterRequest{
    fullName: string;
    email: string;
    password: string;
    confirmPassword : string;
    acceptTerms: boolean;
}

// Datos que se envian al hacer login
export interface LoginRequest{
    fullName : string;
    password : string;
}

// Respuesta del backend cuando se registra o hace login
export interface AuthResponse {
    success: boolean;
    message: string;
    token: string;
    user: {
        id: string;
        fullName: string;
        email: string;
    };
}

// Datos del usuario para guardar en el servicio
export interface User {
  id: string;
  fullName: string;
  email: string;
}