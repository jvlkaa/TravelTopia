import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteViewComponent } from './route-view.component';

describe('RouteViewComponent', () => {
  let component: RouteViewComponent;
  let fixture: ComponentFixture<RouteViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RouteViewComponent]
    });
    fixture = TestBed.createComponent(RouteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
