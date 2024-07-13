import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutesViewComponent } from './routes-view.component';

describe('RoutesViewComponent', () => {
  let component: RoutesViewComponent;
  let fixture: ComponentFixture<RoutesViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoutesViewComponent]
    });
    fixture = TestBed.createComponent(RoutesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
