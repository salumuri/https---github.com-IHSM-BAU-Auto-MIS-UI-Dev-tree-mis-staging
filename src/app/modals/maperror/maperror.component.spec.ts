import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaperrorComponent } from './maperror.component';

describe('MaperrorComponent', () => {
  let component: MaperrorComponent;
  let fixture: ComponentFixture<MaperrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaperrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaperrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
