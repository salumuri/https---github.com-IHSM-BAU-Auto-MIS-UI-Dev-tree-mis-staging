import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackErrorsComponent } from './feedback-errors.component';

describe('FeedbackErrorsComponent', () => {
  let component: FeedbackErrorsComponent;
  let fixture: ComponentFixture<FeedbackErrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedbackErrorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
