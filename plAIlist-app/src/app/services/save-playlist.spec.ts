import { TestBed } from '@angular/core/testing';

import { SavePlaylistServiceService } from './save-playlist-service.service';

describe('SavePlaylistServiceService', () => {
  let service: SavePlaylistServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavePlaylistServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
