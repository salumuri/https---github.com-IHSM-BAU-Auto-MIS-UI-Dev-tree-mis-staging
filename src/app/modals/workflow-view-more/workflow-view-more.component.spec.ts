import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowViewMoreComponent } from './workflow-view-more.component';

describe('WorkflowViewMoreComponent', () => {
  let component: WorkflowViewMoreComponent;
  let fixture: ComponentFixture<WorkflowViewMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowViewMoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowViewMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
