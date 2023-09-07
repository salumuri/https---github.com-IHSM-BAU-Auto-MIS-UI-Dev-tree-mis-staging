import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SLATrackerComponent } from './sla-tracker.component';

describe('SLATrackerComponent', () => {
  let component: SLATrackerComponent;
  let fixture: ComponentFixture<SLATrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SLATrackerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SLATrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
