//Datos que se envian
export interface Playlist{
    id : string,
    playlistName: String;
    memoDescription: String;
    tracks: any[];
    userId: String;
}

// Respuesta del backend cuando se crea la playlist en la BD
export interface PlaylistsResponse{
    success: boolean,
    message: String,
    playlists: Playlist[],
    playlist: Playlist
    }