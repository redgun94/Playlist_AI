/// <reference types="@types/spotify-web-playback-sdk" />
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { filter, take, timeout } from 'rxjs/operators';
import { SpotifyAPIService } from './spotify-api.service';

type GetTokenFn = () => Promise<string>;

@Injectable({
  providedIn: 'root'
})
export class PlaybackService {
  private player: Spotify.Player | undefined;
  private sdkReadyPromise: Promise<void> | null = null;

  private deviceIdSubject = new BehaviorSubject<string | null>(null);
  readonly deviceId$: Observable<string | null> = this.deviceIdSubject.asObservable();

  private playerStateSubject = new BehaviorSubject<Spotify.PlaybackState | null>(null);
  readonly playerState$: Observable<Spotify.PlaybackState | null> = this.playerStateSubject.asObservable();

  private sdkErrorSubject = new BehaviorSubject<string | null>(null);
  readonly sdkError$: Observable<string | null> = this.sdkErrorSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private spotifyApi: SpotifyAPIService
  ) { }

  async initPlayer(getOAuthToken: GetTokenFn): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.player) {
      return;
    }

    this.sdkErrorSubject.next(null);
    await this.loadSdk();

    this.player = new Spotify.Player({
      name: 'plAIlist',
      getOAuthToken: (callback) => {
        getOAuthToken()
          .then(callback)
          .catch((err) => {
            console.error('Error obteniendo token para SDK:', err);
            this.sdkErrorSubject.next('Error al obtener token de Spotify.');
          });
      }
    });

    this.player.addListener('ready', ({ device_id }) => {
      console.log('Spotify SDK conectado, device_id:', device_id);
      this.deviceIdSubject.next(device_id);
      this.sdkErrorSubject.next(null);
    });
    this.player.addListener('not_ready', () => this.deviceIdSubject.next(null));
    this.player.addListener('player_state_changed', (state) => this.playerStateSubject.next(state));
    this.player.addListener('initialization_error', ({ message }) => {
      console.error('Spotify init error:', message);
      this.sdkErrorSubject.next('Error de inicialización del reproductor: ' + message);
    });
    this.player.addListener('authentication_error', ({ message }) => {
      console.error('Spotify auth error:', message);
      this.sdkErrorSubject.next('Error de autenticación con Spotify. Verifica que tu cuenta sea Premium y esté conectada.');
    });
    this.player.addListener('account_error', ({ message }) => {
      console.error('Spotify account error (requiere Premium):', message);
      this.sdkErrorSubject.next('Se requiere una cuenta Spotify Premium para reproducir.');
    });
    this.player.addListener('playback_error', ({ message }) => {
      console.error('Spotify playback error:', message);
      this.sdkErrorSubject.next('Error de reproducción: ' + message);
    });

    await this.player.connect();
  }

  private loadSdk(): Promise<void> {
    if (this.sdkReadyPromise) {
      return this.sdkReadyPromise;
    }
    this.sdkReadyPromise = new Promise((resolve) => {
      if ((window as any).Spotify) {
        resolve();
        return;
      }
      (window as any).onSpotifyWebPlaybackSDKReady = () => resolve();
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    });
    return this.sdkReadyPromise;
  }

  async play(uris: string[]): Promise<void> {
    if (!uris.length) {
      throw new Error('No hay canciones para reproducir');
    }
    const deviceId = await firstValueFrom(
      this.deviceId$.pipe(
        filter((id): id is string => !!id),
        take(1),
        timeout(8000)
      )
    );
    await firstValueFrom(this.spotifyApi.startPlayback(deviceId, uris));
  }

  togglePlay(): void {
    this.player?.togglePlay();
  }

  nextTrack(): void {
    this.player?.nextTrack();
  }

  previousTrack(): void {
    this.player?.previousTrack();
  }

  disconnect(): void {
    this.player?.disconnect();
    this.player = undefined;
    this.deviceIdSubject.next(null);
  }
}
