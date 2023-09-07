import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandSupplyReportComponent } from './demand-supply-report.component';

describe('DemandSupplyReportComponent', () => {
  let component: DemandSupplyReportComponent;
  let fixture: ComponentFixture<DemandSupplyReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DemandSupplyReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DemandSupplyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
