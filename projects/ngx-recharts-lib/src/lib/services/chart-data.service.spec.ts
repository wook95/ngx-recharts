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

  describe('unifiedYDomain with registered items', () => {
    let registry: GraphicalItemRegistryService;

    beforeEach(() => {
      registry = TestBed.inject(GraphicalItemRegistryService);
    });

    it('should return null when no items are registered', () => {
      service.setData([{ name: 'Jan', value: 100 }]);
      expect(service.unifiedYDomain()).toBeNull();
    });

    it('should compute domain as [0, max] for positive-only data', () => {
      registry.register({ id: 'line-0', type: 'line', dataKey: 'value' });
      service.setData([
        { name: 'Jan', value: 10 },
        { name: 'Feb', value: 50 },
        { name: 'Mar', value: 30 },
      ]);
      expect(service.unifiedYDomain()).toEqual([0, 50]);
    });

    it('should compute domain as [min, max] with negative values', () => {
      registry.register({ id: 'line-0', type: 'line', dataKey: 'value' });
      service.setData([
        { name: 'Jan', value: -20 },
        { name: 'Feb', value: 50 },
      ]);
      expect(service.unifiedYDomain()).toEqual([-20, 50]);
    });

    it('should include 0 in max when all values are negative', () => {
      registry.register({ id: 'line-0', type: 'line', dataKey: 'value' });
      service.setData([
        { name: 'Jan', value: -50 },
        { name: 'Feb', value: -10 },
      ]);
      expect(service.unifiedYDomain()).toEqual([-50, 0]);
    });

    it('should exclude hidden items from domain computation', () => {
      registry.register({ id: 'line-0', type: 'line', dataKey: 'value' });
      registry.register({ id: 'line-1', type: 'line', dataKey: 'big', hide: true });
      service.setData([
        { name: 'Jan', value: 10, big: 9999 },
        { name: 'Feb', value: 50, big: 8888 },
      ]);
      expect(service.unifiedYDomain()).toEqual([0, 50]);
    });

    it('should return null when all items are hidden', () => {
      registry.register({ id: 'line-0', type: 'line', dataKey: 'value', hide: true });
      service.setData([{ name: 'Jan', value: 100 }]);
      expect(service.unifiedYDomain()).toBeNull();
    });

    it('should handle non-numeric data values (defaults to 0)', () => {
      registry.register({ id: 'line-0', type: 'line', dataKey: 'value' });
      service.setData([
        { name: 'Jan', value: 'not-a-number' },
        { name: 'Feb', value: 50 },
      ]);
      expect(service.unifiedYDomain()).toEqual([0, 50]);
    });

    it('should compute domain across multiple visible items', () => {
      registry.register({ id: 'line-0', type: 'line', dataKey: 'a' });
      registry.register({ id: 'line-1', type: 'line', dataKey: 'b' });
      service.setData([
        { name: 'Jan', a: 10, b: 200 },
        { name: 'Feb', a: 80, b: 5 },
      ]);
      expect(service.unifiedYDomain()).toEqual([0, 200]);
    });

    it('should recompute domain when yDomainMode toggles back to unified', () => {
      registry.register({ id: 'line-0', type: 'line', dataKey: 'value' });
      service.setData([{ name: 'Jan', value: 100 }]);

      service.setYDomainMode('independent');
      expect(service.unifiedYDomain()).toBeNull();

      service.setYDomainMode('unified');
      expect(service.unifiedYDomain()).toEqual([0, 100]);
    });
  });
});
