import User from "../models/User";
import jwt from 'jsonwebtoken';

// Registrar nuevo usuario
export const register = async (req, res) => {
    try {
        // 1. Extraer datos del body
        const {fullName, email, password, confirmPassword, acceptTerms} = req.body;
         // 2. Validar que las contraseñas coincidan
         if(password !== confirmPassword){
            return res.status(400).jason({
                success: false,
                message: 'The passwords do not match' 
            });
         }
         if(acceptTerms!){
            return res.status(400).jason({
                success: false,
                message: "You should accept the terms and conditions"
            });
         }
         //Crear nuevo usuario
         const newUser = new User({
             fullName,
             email,
             password // Se hasheará automáticamente por el middleware pre-save
         });

         await newUser.save();

         //Generar un token JWT
         const token = jwt.sign(
            { userId: newUser._id, email: newUser.email},
            process.env.JWT_SECRET,
            { expiresIn: '7d'}

         );

         //Responder con exito
         res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user:{
                id: newUser._id,
                fullName: newUser.fullName,
                email:newUser.email
            }
         });
    }catch(error) {
        // Manejar errores de validacion 
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0]
            });
        }
         // Error del servidor
        console.error('Error en registro:', error);
            res.status(500).json({ 
            success: false,
            message: 'Error al registrar usuario. Intenta nuevamente.' 
        });
    }

}

