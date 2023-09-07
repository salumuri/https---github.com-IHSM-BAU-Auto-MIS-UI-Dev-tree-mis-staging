import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkstreamUsersComponent } from './workstream-users.component';

describe('WorkstreamUsersComponent', () => {
  let component: WorkstreamUsersComponent;
  let fixture: ComponentFixture<WorkstreamUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkstreamUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkstreamUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
