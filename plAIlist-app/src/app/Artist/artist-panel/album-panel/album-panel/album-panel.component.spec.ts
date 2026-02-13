import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumPanelComponent } from './album-panel.component';

describe('AlbumPanelComponent', () => {
  let component: AlbumPanelComponent;
  let fixture: ComponentFixture<AlbumPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlbumPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
