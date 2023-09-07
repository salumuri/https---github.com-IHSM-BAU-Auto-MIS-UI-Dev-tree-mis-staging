import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientViewFeedbackListComponent } from './client-view-feedback-list.component';

describe('ClientViewFeedbackListComponent', () => {
  let component: ClientViewFeedbackListComponent;
  let fixture: ComponentFixture<ClientViewFeedbackListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientViewFeedbackListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientViewFeedbackListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
