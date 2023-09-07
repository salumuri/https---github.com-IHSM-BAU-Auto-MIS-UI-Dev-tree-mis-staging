import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeentryListComponent } from './timeentry-list.component';

describe('TimeentryListComponent', () => {
  let component: TimeentryListComponent;
  let fixture: ComponentFixture<TimeentryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeentryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeentryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
