import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// Interface para el body del registro
interface RegisterRequestBody {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
interface LoginRequestBody{
  email: string;
  password: string;
}

// Registrar nuevo usuario
export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, confirmPassword, acceptTerms } = req.body;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      res.status(400).json({ 
        success: false,
        message: 'Las contraseñas no coinciden' 
      });
      return;
    }

    // Validar que aceptó los términos
    if (!acceptTerms) {
      res.status(400).json({ 
        success: false,
        message: 'Debes aceptar los términos y condiciones' 
      });
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ 
        success: false,
        message: 'Este email ya está registrado' 
      });
      return;
    }

    // Crear nuevo usuario
    const newUser = new User({
      fullName,
      email,
      password
    });

    // Guardar en la base de datos
    await newUser.save();

    // Generar token JWT
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Responder con éxito
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email
      }
    });

  } catch (error) {
    // Manejar errores de validación de Mongoose
    if ((error as any).name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((err: any) => err.message);
      res.status(400).json({ 
        success: false,
        message: messages[0]
      });
      return;
    }

    // Error del servidor
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al registrar usuario. Intenta nuevamente.' 
    });
  }
};
export const login = async (req : Request<{},{}, LoginRequestBody>, res: Response): Promise<void> => {

  try{
    const {email,password} = req.body;
 // Verificar si el usuario ya existe
    if (!email && !password){
        res.status(401).json({
          success : false,
          message : "Email and password are required"
        })
      }
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if(!existingUser){
        res.status(401).json(
          {
            success : false,
            message : "We could not find any match with your info"
          }
        )
        return;}
      const isPasswordValid = await existingUser.comparePassword(password);
      if (!isPasswordValid){
        res.status(401).json(
          {
            success : false,
            message : "We could not find any match with your info"
          }
        )
        return;
      }
      const token = jwt.sign(
        {
          userId : existingUser._id, email: existingUser.email
        },
        process.env.JWT_SECRET as string,
        { expiresIn : '7d'}
      );
      res.status(200).json({
        success : true,
        message : `Welcome ${existingUser.fullName}`,
        token,
        user: {
          id:existingUser._id,
          fullName: existingUser.fullName,
          email: existingUser.email
        }

      })
  } catch(error){
    console.error('Error found:', error);
    res.status(500).json({
      success : false,
      message : "Error found, try later"
    });
  }

    }