export const callbackSpotify = async (req: Request, res: Response) => {
    const FRONT_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
  
    try {
      const { code, state: rawState } = req.query;
  
      // 1. Validar state
      if (!rawState || !code) {
        return res.redirect(`${FRONT_URL}/auth/login?error=missing_params`);
      }
  
      let statePayload;
      try {
        statePayload = decodeState(rawState as string);
      } catch {
        return res.redirect(`${FRONT_URL}/auth/login?error=invalid_state`);
      }
  
      // 2. Intercambiar code por tokens con Spotify
      const tokenRes = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString('base64')}`,
          },
        }
      );
  
      const { access_token, refresh_token, expires_in } = tokenRes.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);
  
      // 3. Obtener perfil de Spotify
      const profileRes = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
  
      const { id: spotifyUserId, email: spotifyEmail } = profileRes.data;
  
      // 4. Resolver userId según contexto
      let userId: string | null = null;
  
      if (statePayload.context === 'dashboard' && statePayload.userId) {
        // Viene del dashboard — userId ya conocido
        if (!mongoose.Types.ObjectId.isValid(statePayload.userId)) {
          return res.redirect(`${FRONT_URL}/dashboard?error=invalid_user`);
        }
        userId = statePayload.userId;
  
      } else {
        // Viene del login SSO — buscar usuario existente
        const existingAuth = await UserSpotifyAuth.findOne({ spotifyUserId }).populate('userId');
  
        if (existingAuth) {
          // Ya conectó Spotify antes
          userId = existingAuth.userId.toString();
        } else {
          // Buscar por email
          const user = await User.findOne({ email: spotifyEmail });
  
          if (user) {
            userId = user._id.toString();
          } else {
            // Usuario nuevo — redirigir a registro con datos de Spotify
            return res.redirect(
              `${FRONT_URL}/auth/register?spotifyUserId=${spotifyUserId}&email=${spotifyEmail}`
            );
          }
        }
      }
  
      // 5. Guardar/actualizar tokens de Spotify
      await UserSpotifyAuth.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        {
          userId: new mongoose.Types.ObjectId(userId),
          spotifyUserId,
          spotifyEmail,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt,
        },
        { upsert: true, new: true }
      );
  
      // 6. Generar JWT y setearlo como httpOnly cookie
      const jwtToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  
      res.cookie('token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      // 7. Redirigir según contexto
      const redirectUrl = statePayload.context === 'dashboard'
        ? `${FRONT_URL}/dashboard?spotify_connected=true`
        : `${FRONT_URL}/dashboard`;
  
      res.redirect(redirectUrl);
  
    } catch (err) {
      console.error('Error en callback de Spotify:', err);
      res.redirect(`${FRONT_URL}/auth/login?error=server_error`);
    }
  };