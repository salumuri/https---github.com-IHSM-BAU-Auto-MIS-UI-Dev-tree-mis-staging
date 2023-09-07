import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTimeentryComponent } from './single-timeentry.component';

describe('SingleTimeentryComponent', () => {
  let component: SingleTimeentryComponent;
  let fixture: ComponentFixture<SingleTimeentryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleTimeentryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleTimeentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
