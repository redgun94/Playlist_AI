import { TestBed } from '@angular/core/testing';

import { GeminiServicesService } from './gemini-services.service';

describe('GeminiServicesService', () => {
  let service: GeminiServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeminiServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
