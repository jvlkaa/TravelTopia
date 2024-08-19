import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutesUserViewComponent } from './routes-user-view.component';

describe('RoutesUserViewComponent', () => {
  let component: RoutesUserViewComponent;
  let fixture: ComponentFixture<RoutesUserViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoutesUserViewComponent]
    });
    fixture = TestBed.createComponent(RoutesUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
