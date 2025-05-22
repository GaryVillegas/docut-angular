import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateStorePage } from './create-store.page';

describe('CreateStorePage', () => {
  let component: CreateStorePage;
  let fixture: ComponentFixture<CreateStorePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
