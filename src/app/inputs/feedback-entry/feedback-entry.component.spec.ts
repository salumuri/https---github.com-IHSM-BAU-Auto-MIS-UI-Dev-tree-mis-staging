import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackEntryComponent } from './feedback-entry.component';

describe('FeedbackEntryComponent', () => {
  let component: FeedbackEntryComponent;
  let fixture: ComponentFixture<FeedbackEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedbackEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
