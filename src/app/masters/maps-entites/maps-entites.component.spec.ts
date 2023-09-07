import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsEntitesComponent } from './maps-entites.component';

describe('MapsEntitesComponent', () => {
  let component: MapsEntitesComponent;
  let fixture: ComponentFixture<MapsEntitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapsEntitesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsEntitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
