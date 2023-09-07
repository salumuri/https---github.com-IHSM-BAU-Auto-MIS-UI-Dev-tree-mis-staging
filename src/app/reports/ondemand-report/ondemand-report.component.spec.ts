import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OndemandReportComponent } from './ondemand-report.component';

describe('OndemandReportComponent', () => {
  let component: OndemandReportComponent;
  let fixture: ComponentFixture<OndemandReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OndemandReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OndemandReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
