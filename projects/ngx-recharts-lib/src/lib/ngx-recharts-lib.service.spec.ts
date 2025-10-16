import { TestBed } from '@angular/core/testing';

import { NgxRechartsLibService } from './ngx-recharts-lib.service';

describe('NgxRechartsLibService', () => {
  let service: NgxRechartsLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxRechartsLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
