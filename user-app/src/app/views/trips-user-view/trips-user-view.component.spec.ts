import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripsUserViewComponent } from './trips-user-view.component';

describe('TripsUserViewComponent', () => {
  let component: TripsUserViewComponent;
  let fixture: ComponentFixture<TripsUserViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TripsUserViewComponent]
    });
    fixture = TestBed.createComponent(TripsUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
