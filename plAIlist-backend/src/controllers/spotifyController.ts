import { Request, Response } from 'express';
import axios from 'axios';

interface TokenData {
    accessToken: string;
    expiresAt: number; // timestamp en ms
}
  let tokenData: TokenData | null = null;
  const spotifyClient = createSpotifyClient();
  
const fetchSpotifyToken  = async (): Promise<string> => {
  const clientId = process.env.SPOTIFY_CLIENT_ID ?? "";
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET ?? "";
  const url = 'https://accounts.spotify.com/api/token';

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);


  try {
    const response = await axios.post<{ access_token: string; expires_in: number }>(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      }
    });

    const {access_token, expires_in } = response.data;
    tokenData = {
        accessToken : access_token,
        expiresAt : Date.now() + (expires_in- 60)*1000
    };

    if (access_token) {
      console.log('Token recibido ', access_token );
     
    } else {
    }
  } catch (error) {
    console.error('Error obteniendo el token', error);
  }


  return tokenData?.accessToken ?? "";
};

const getValidToken = async (): Promise<string> => {
    console.log("Corriendo getValid")
    if (!tokenData || Date.now() >= tokenData.expiresAt) {
      console.log('Token expirado o inexistente, renovando...');
      return await fetchSpotifyToken();
    }else{
        console.log("Token valido")
    }
    return tokenData.accessToken;
  };
  
export const getTokenSpotify = async (req: Request, res:Response):Promise<void>=>{
  
    try{
        const token = await getValidToken();
        console.log(token);
        if(token){
            res.status(200).json({
                success: true,
                token : token
            });
        }
    }catch(error){
        console.error('Error obteniendo el token', error);
        res.status(500).json({ 
            success: false, message: 'Failed to get Spotify token'
         });
    }
} 
// renovación automática garantizada
 function createSpotifyClient() {
    const spotifyClient = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      timeout: 5000,
    });
  
    // Interceptor de request: inserta siempre un token válido
    spotifyClient.interceptors.request.use(async (config) => {
      const token = await getValidToken(); // renueva si expiró
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  
    // Interceptor de response: si Spotify devuelve 401, renueva y reintenta
    spotifyClient.interceptors.response.use(
      (res) => res,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true; // evita loop infinito
          tokenData = null;           // fuerza renovación
          const newToken = await getValidToken();
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return spotifyClient.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  
    return spotifyClient;
  }

  export const searchArtists = async (req: Request, res: Response) => {
    const name = req.query.q;
    
    try {
      const response = await spotifyClient.get('/search', {
        params: {
          q: name,
          type: 'artist',
          limit: 5,
        }
      });
      
        res.status(200).json({
            success : true,
            message: "Artits",
            data: response.data

      });
      
    } catch (error: any) {
      console.error('Error en searchArtists:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      throw error;
    }
  };
  export const searchSongsByArtist = async(req:Request, res:Response):Promise<void>=>{
    const artist = req.query.q;
    console.log(artist);
    try{
      const response = await spotifyClient.get('/search', {
        params: {
          q: artist,
          type: 'track',
          limit: 15
        }
      });
      if(response){
        res.status(200).json({
          success: true,
          message: "Popular Tracks ",
          data : response.data
        })
      }
    } catch (error: any){
        console.error('Error en searchArtists:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        throw error;
    }
    }
    export const getAlbumsByArtist = async(req:Request, res:Response):Promise<void>=>{
      const artistId = req.query.id;
      try{
        const response = await spotifyClient.get(`/artists/${artistId}/albums`,{params : {
          include_groups : '',
          market: 'US',
          limit : '50',
      
        }});
        if(response){
          res.status(200).json({
            success : true,
            message : "Artists's Albums ",
            data: response.data
          })
        }
      }catch (error: any){
        console.error('Error en searchArtists:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        throw error;
    }
    }
    export const getTracksByAlbums = async(req:Request, res:Response):Promise<void>=>{
      const albumId = req.query.id;
      try{
        console.log(albumId);

        const response = await spotifyClient.get(`/albums/${albumId}/tracks`,{params:{
          limit : '50'
        }});
        console.log(response.data);
        if(response){
          res.status(200).json({
            success: true,
            message: "Tracks by Albums",
            data: response.data
          })
        }
      }catch (error: any){
        console.error('Error en searchArtists:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        throw error;
    }
    }
