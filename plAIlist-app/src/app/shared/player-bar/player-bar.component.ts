/// <reference types="@types/spotify-web-playback-sdk" />
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, firstValueFrom } from 'rxjs';
import { PlaybackService } from '../../services/playback.service';
import { SpotifyAPIService } from '../../services/spotify-api.service';

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

  private subs = new Subscription();

  constructor(
    private playbackService: PlaybackService,
    private spotifyApi: SpotifyAPIService
  ) { }

  ngOnInit(): void {
    this.spotifyApi.getPlaybackToken().subscribe({
      next: (res) => {
        this.spotifyLinked = res.userAuthenticated;
        this.isPremium = !!res.isPremium;
        if (this.spotifyLinked && this.isPremium) {
          this.playbackService.initPlayer(() =>
            firstValueFrom(this.spotifyApi.getPlaybackToken()).then(r => r.accessToken!)
          );
        }
      },
      error: () => {
        this.spotifyLinked = false;
      }
    });

    this.subs.add(this.playbackService.deviceId$.subscribe(id => this.deviceReady = !!id));
    this.subs.add(this.playbackService.playerState$.subscribe(state => this.playerState = state));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
