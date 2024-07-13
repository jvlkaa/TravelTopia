import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRouteViewComponent } from './create-route-view.component';

describe('CreateRouteViewComponent', () => {
  let component: CreateRouteViewComponent;
  let fixture: ComponentFixture<CreateRouteViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateRouteViewComponent]
    });
    fixture = TestBed.createComponent(CreateRouteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
