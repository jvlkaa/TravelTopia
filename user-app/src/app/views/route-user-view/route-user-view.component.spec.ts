import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteUserViewComponent } from './route-user-view.component';

describe('RouteUserViewComponent', () => {
  let component: RouteUserViewComponent;
  let fixture: ComponentFixture<RouteUserViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RouteUserViewComponent]
    });
    fixture = TestBed.createComponent(RouteUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
