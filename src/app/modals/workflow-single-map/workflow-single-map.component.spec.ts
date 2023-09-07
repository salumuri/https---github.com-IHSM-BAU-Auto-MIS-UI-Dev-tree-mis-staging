import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowSingleMapComponent } from './workflow-single-map.component';

describe('WorkflowSingleMapComponent', () => {
  let component: WorkflowSingleMapComponent;
  let fixture: ComponentFixture<WorkflowSingleMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowSingleMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowSingleMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
