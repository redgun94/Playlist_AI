//Datos que se envian
export interface Playlist{
    _id : string,
    playlistName: string;
    memoDescription: string;
    tracks: any[];
    userId: string;
}

// Respuesta del backend cuando se crea la playlist en la BD
export interface PlaylistsResponse{
    success: boolean,
    message: string,
    playlists: Playlist[],
    playlist: Playlist,
    }
    export interface deletedResponse{
        success: boolean,
        message: string,
    }