import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxRechartsLibComponent } from './ngx-recharts-lib.component';

describe('NgxRechartsLibComponent', () => {
  let component: NgxRechartsLibComponent;
  let fixture: ComponentFixture<NgxRechartsLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxRechartsLibComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxRechartsLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
