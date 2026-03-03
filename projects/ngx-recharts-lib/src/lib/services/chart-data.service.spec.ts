import { TestBed } from '@angular/core/testing';
import { ChartDataService } from './chart-data.service';
import { GraphicalItemRegistryService } from './graphical-item-registry.service';

describe('ChartDataService', () => {
  let service: ChartDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChartDataService, GraphicalItemRegistryService],
    });
    service = TestBed.inject(ChartDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty data', () => {
    expect(service.data()).toEqual([]);
  });

  it('should set and get data', () => {
    const data = [{ name: 'Jan', value: 100 }, { name: 'Feb', value: 200 }];
    service.setData(data);
    expect(service.data()).toEqual(data);
    expect(service.data().length).toBe(2);
  });

  it('should set chart type', () => {
    expect(service.chartType()).toBe('line');
    service.setChartType('bar');
    expect(service.chartType()).toBe('bar');
  });

  it('should set margin', () => {
    const margin = { top: 20, right: 10, bottom: 20, left: 10 };
    service.setMargin(margin);
    expect(service.margin()).toEqual(margin);
  });

  it('should set bar size', () => {
    expect(service.barSize()).toBeUndefined();
    service.setBarSize(30);
    expect(service.barSize()).toBe(30);
  });

  it('should set bar gap', () => {
    expect(service.barGap()).toBe(4);
    service.setBarGap(8);
    expect(service.barGap()).toBe(8);
  });

  it('should set bar category gap', () => {
    expect(service.barCategoryGap()).toBe('10%');
    service.setBarCategoryGap(20);
    expect(service.barCategoryGap()).toBe(20);
  });

  it('should set stack offset', () => {
    expect(service.stackOffset()).toBe('none');
    service.setStackOffset('expand');
    expect(service.stackOffset()).toBe('expand');
  });

  it('should return null for unifiedYDomain when data is empty', () => {
    expect(service.unifiedYDomain()).toBeNull();
  });

  it('should return null for unifiedYDomain in independent mode', () => {
    service.setYDomainMode('independent');
    service.setData([{ name: 'Jan', value: 100 }]);
    expect(service.unifiedYDomain()).toBeNull();
  });
});
