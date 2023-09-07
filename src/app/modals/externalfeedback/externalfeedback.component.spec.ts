import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalfeedbackComponent } from './externalfeedback.component';

describe('ExternalfeedbackComponent', () => {
  let component: ExternalfeedbackComponent;
  let fixture: ComponentFixture<ExternalfeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternalfeedbackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalfeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
