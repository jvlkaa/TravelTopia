import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripsViewComponent } from './trips-view.component';

describe('TripsViewComponent', () => {
  let component: TripsViewComponent;
  let fixture: ComponentFixture<TripsViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TripsViewComponent]
    });
    fixture = TestBed.createComponent(TripsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
