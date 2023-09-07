import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackerrorsComponent } from './feedbackerrors.component';

describe('FeedbackerrorsComponent', () => {
  let component: FeedbackerrorsComponent;
  let fixture: ComponentFixture<FeedbackerrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedbackerrorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackerrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
