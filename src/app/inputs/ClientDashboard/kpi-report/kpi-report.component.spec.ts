import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KPIReportComponent } from './kpi-report.component';

describe('KPIReportComponent', () => {
  let component: KPIReportComponent;
  let fixture: ComponentFixture<KPIReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KPIReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KPIReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
