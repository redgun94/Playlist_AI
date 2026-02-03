import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistTrackComponent } from './playlist-track.component';

describe('PlaylistTrackComponent', () => {
  let component: PlaylistTrackComponent;
  let fixture: ComponentFixture<PlaylistTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistTrackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
