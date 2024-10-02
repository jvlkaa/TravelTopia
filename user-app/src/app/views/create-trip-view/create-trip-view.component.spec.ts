import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTripViewComponent } from './create-trip-view.component';

describe('CreateTripViewComponent', () => {
  let component: CreateTripViewComponent;
  let fixture: ComponentFixture<CreateTripViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateTripViewComponent]
    });
    fixture = TestBed.createComponent(CreateTripViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
