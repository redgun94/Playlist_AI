import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import UserSpotifyAuth from '../models/userSpotifyAuth';

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

export const loginSpotify = async(req: Request, res: Response):Promise<void>=>{
  
    const userId = req.query.userId as string;
    console.log("LLamando al login de Spotify",userId);
    const params = new URLSearchParams({
      client_id : process.env.SPOTIFY_CLIENT_ID!,
      response_type: "code",
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      scope: "playlist-modify-public playlist-modify-private user-read-email",
      state: userId,
      show_dialog: "true"
    });
    console.log("Redirigiendo a Spotify ")
    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}

export const callbackSpotify = async(req: Request, res: Response):Promise<void>=>{
  const { code, state } = req.query;
  try{
    console.log("Llamada del callback de Spotify")
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!
      }),{
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        }
      }
    );
    const { access_token, refresh_token, expires_in } = response.data;
    const userProfile = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const spotifyUserId = userProfile.data.id;
    const expiresAt = new Date(Date.now() + expires_in * 1000);
    const userId = state as string;
    
    if(!userId || userId.trim() === ''){
      console.error('Error: userId (state) no proporcionado en el callback');
      res.redirect(`http://localhost:4200/dashboard?spotify_connected=false&error=no_user_id`);
      return;
    }

    try {
      await UserSpotifyAuth.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { 
          userId: new mongoose.Types.ObjectId(userId), 
          spotifyUserId, 
          accessToken: access_token, 
          refreshToken: refresh_token, 
          expiresAt 
        },
        { upsert: true, new: true }
      );
      res.redirect(`http://localhost:4200/dashboard?spotify_connected=true`);
    } catch(dbError) {
      console.error('Error guardando en DB:', dbError);
      res.redirect(`http://localhost:4200/dashboard?spotify_connected=false&error=db_error`);
    }
  } catch(error){
    console.error('Error en callbackSpotify:', error);
    res.status(500).json({ success: false, message: 'Error en autenticación con Spotify' });
  }
}
export const refreshTokenUser = async(refreshToken:string)=>{

   const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64')}`
  };

  try{

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      body,
      { headers }
    );
  return response.data;
  }catch(error){
    console.error('Error refreshing token:', error);
    throw error;
  }

}
export const getUserSpotify = async(req: Request, res: Response):Promise<any>=>{
  
  const userId = req.query.q;
  console.log("Obteniendo usuario spotify",userId);
  const userSpotifyactive = await UserSpotifyAuth.findOne({userId});

  if(!userSpotifyactive?.spotifyUserId){
      console.log("USuario no auntenticado");
      return res.status(200).json({
        success: true,
        message : "User not Authenticated in Spotify",
        userAuthenticated : false
    })
  }
  if(userSpotifyactive?.expiresAt.getTime()! < Date.now()){
    const dataTokens = await refreshTokenUser(userSpotifyactive.refreshToken);
    if(!dataTokens){
      return res.status(404).json({
        success : false,
        message : "Error: expired or unauthorized user.",
        userAuthenticated : false
      })
    };
    userSpotifyactive.accessToken = dataTokens.access_token;
    userSpotifyactive.expiresAt = new Date(Date.now() + dataTokens.expires_in * 1000);
    userSpotifyactive.save();
    return res.status(200).json({
      success: true,
      message: "User Authenticated and access token renewed",
      userAuthenticated : true
    });
  };
  res.status(200).json({
    success: true,
    message : "User Authenticated",
    userAuthenticated : true
  })
}

export const ssoGoogle = async(req: Request, res: Response):Promise<void>=>{
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI;
    const ssoGoogleUrl = process.env.GOOGLE_URL_AUTH;

    // Ensure env vars are defined so TypeScript (and runtime) don't receive `undefined`.
    if (!redirect_uri) {
      res.status(500).json({
        success: false,
        message: 'Missing env var: GOOGLE_REDIRECT_URI',
      });
      return;
    }

    if (!ssoGoogleUrl) {
      res.status(500).json({
        success: false,
        message: 'Missing env var: GOOGLE_URL_AUTH',
      });
      return;
    }

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent"
    });
    console.log("redirigiendo para google sso");
    res.redirect(`${ssoGoogleUrl}?${params.toString()}`);
}
export const callbackGoogle = async(req: Request, res: Response): Promise<void> => {
  const { code } = req.query;

  if (!code) {
    res.redirect(`http://127.0.0.1:4200/auth?error=no_code`);
    return;
  }
  console.log("estamos en callback intercambiando tokens");
  try {
    // Paso 1 — Intercambia el code por tokens con Google
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      code: code as string,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code'
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { id_token } = tokenResponse.data;

    // Paso 2 — Decodifica el id_token (es un JWT, no necesitas verificarlo con Google
    //           porque viene directamente de su endpoint seguro)
    const decoded = JSON.parse(
      Buffer.from(id_token.split('.')[1], 'base64').toString('utf-8')
    ) as {
      sub: string;    // googleId único
      email: string;
      name: string;
      picture: string;
    };

    const { sub: googleId, email, name, picture } = decoded;

    // Paso 3 — findOrCreate: busca por googleId → por email → crea nuevo
    let user = await User.findOne({ googleId });

    if (!user) {
      // No existe con ese googleId, ¿existe con ese email? (cuenta local preexistente)
      user = await User.findOne({ email });

      if (user) {
        // Vincula el googleId a la cuenta existente
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      } else {
        // Usuario completamente nuevo, lo crea
        user = await User.create({
          fullName: name,
          email,
          googleId,
          picture,
          authProvider: 'google'
          // sin password
        });
      }
    }

    // Paso 4 — Redirigir al frontend con el userId igual que el login normal
    const token = jwt.sign(
      {userId : user._id, email: user.email, fullName: user.fullName },
      process.env.JWT_SECRET as string,
      { expiresIn : '7d'}
    );
    res.redirect(`http://localhost:4200/auth/callback?userId=${token}`);

  } catch (error) {
    console.error('Error en callbackGoogle:', error);
    res.redirect(`http://127.0.0.1:4200/auth?error=google_auth_failed`);
  }
};
