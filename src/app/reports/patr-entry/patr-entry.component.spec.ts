import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatrEntryComponent } from './patr-entry.component';

describe('PatrEntryComponent', () => {
  let component: PatrEntryComponent;
  let fixture: ComponentFixture<PatrEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatrEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatrEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
