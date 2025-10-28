import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistPanelComponent } from './artist-panel.component';

describe('ArtistPanelComponent', () => {
  let component: ArtistPanelComponent;
  let fixture: ComponentFixture<ArtistPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
