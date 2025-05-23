import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreServicePage } from './store-service.page';

describe('StoreServicePage', () => {
  let component: StoreServicePage;
  let fixture: ComponentFixture<StoreServicePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreServicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
