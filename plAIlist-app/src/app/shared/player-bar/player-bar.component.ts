/// <reference types="@types/spotify-web-playback-sdk" />
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, firstValueFrom } from 'rxjs';
import { PlaybackService } from '../../services/playback.service';
import { SpotifyAPIService } from '../../services/spotify-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-player-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-bar.component.html',
  styleUrl: './player-bar.component.css'
})
export class PlayerBarComponent implements OnInit, OnDestroy {
  spotifyLinked = false;
  isPremium = false;
  deviceReady = false;
  playerState: Spotify.PlaybackState | null = null;
  sdkError: string | null = null;

  private subs = new Subscription();

  constructor(
    private playbackService: PlaybackService,
    private spotifyApi: SpotifyAPIService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.spotifyApi.getPlaybackToken().subscribe({
      next: (res) => {
        this.spotifyLinked = res.userAuthenticated;
        this.isPremium = !!res.isPremium;

        if (this.spotifyLinked && this.isPremium) {
          this.checkScopesAndInit();
        }
      },
      error: () => {
        this.spotifyLinked = false;
      }
    });

    this.subs.add(this.playbackService.deviceId$.subscribe(id => this.deviceReady = !!id));
    this.subs.add(this.playbackService.playerState$.subscribe(state => this.playerState = state));
    this.subs.add(this.playbackService.sdkError$.subscribe(err => this.sdkError = err));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private checkScopesAndInit(): void {
    this.spotifyApi.checkPlaybackScopes().subscribe({
      next: (scopeRes) => {
        if (scopeRes.needsReauth) {
          const user = this.authService.currentUserValue;
          const userId = user?.id || '';
          window.location.href = this.spotifyApi.getSpotifyLoginUrl(userId);
          return;
        }
        this.initSdk();
      },
      error: () => {
        this.sdkError = 'No se pudieron verificar los permisos de Spotify.';
      }
    });
  }

  private initSdk(): void {
    this.playbackService.initPlayer(() =>
      firstValueFrom(this.spotifyApi.getPlaybackToken()).then(r => {
        if (!r.accessToken) {
          throw new Error('No se obtuvo el token de Spotify');
        }
        return r.accessToken;
      })
    );
  }

  get currentTrack() {
    return this.playerState?.track_window?.current_track ?? null;
  }

  get isPaused(): boolean {
    return this.playerState?.paused ?? true;
  }

  togglePlay(): void {
    this.playbackService.togglePlay();
  }

  next(): void {
    this.playbackService.nextTrack();
  }

  previous(): void {
    this.playbackService.previousTrack();
  }
}
