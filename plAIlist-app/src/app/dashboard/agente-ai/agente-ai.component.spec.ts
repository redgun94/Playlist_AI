import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenteAiComponent } from './agente-ai.component';

describe('AgenteAiComponent', () => {
  let component: AgenteAiComponent;
  let fixture: ComponentFixture<AgenteAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgenteAiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenteAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
