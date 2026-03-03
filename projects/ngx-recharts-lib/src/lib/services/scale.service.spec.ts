import { ScaleService } from './scale.service';

describe('ScaleService', () => {
  let service: ScaleService;

  beforeEach(() => {
    service = new ScaleService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createLinearScale', () => {
    it('should create a linear scale mapping domain to range', () => {
      const scale = service.createLinearScale([0, 100], [0, 400]);
      expect(scale(0)).toBe(0);
      expect(scale(100)).toBe(400);
      expect(scale(50)).toBe(200);
    });

    it('should create an inverted linear scale for Y axis', () => {
      const scale = service.createLinearScale([0, 100], [300, 0]);
      expect(scale(0)).toBe(300);
      expect(scale(100)).toBe(0);
      expect(scale(50)).toBe(150);
    });
  });

  describe('createBandScale', () => {
    it('should create a band scale for categorical data', () => {
      const scale = service.createBandScale(['Jan', 'Feb', 'Mar'], [0, 300]);
      expect(scale.domain()).toEqual(['Jan', 'Feb', 'Mar']);
      expect(scale.bandwidth()).toBeGreaterThan(0);
    });

    it('should return defined values for domain members', () => {
      const scale = service.createBandScale(['A', 'B'], [0, 200]);
      expect(scale('A')).toBeDefined();
      expect(scale('B')).toBeDefined();
      expect(scale('A')).toBeLessThan(scale('B')!);
    });

    it('should have padding applied', () => {
      const scale = service.createBandScale(['A', 'B', 'C'], [0, 300]);
      // With padding(0.1), bandwidth < step
      expect(scale.bandwidth()).toBeLessThan(300 / 3);
    });
  });

  describe('getLinearDomain', () => {
    it('should return [0,0] for empty data', () => {
      expect(service.getLinearDomain([], 'value')).toEqual([0, 0]);
    });

    it('should compute domain from data values', () => {
      const data = [{ name: 'A', value: 10 }, { name: 'B', value: 50 }, { name: 'C', value: 30 }];
      const [min, max] = service.getLinearDomain(data, 'value');
      expect(min).toBe(0); // recharts includes 0
      expect(max).toBe(50);
    });

    it('should include 0 in domain when all values are positive', () => {
      const data = [{ value: 100 }, { value: 200 }];
      const [min] = service.getLinearDomain(data, 'value');
      expect(min).toBe(0);
    });

    it('should handle negative values', () => {
      const data = [{ value: -50 }, { value: 30 }];
      const [min, max] = service.getLinearDomain(data, 'value');
      expect(min).toBe(-50);
      expect(max).toBe(30);
    });
  });

  describe('getCategoryDomain', () => {
    it('should extract category values as strings', () => {
      const data = [{ name: 'Jan' }, { name: 'Feb' }, { name: 'Mar' }];
      expect(service.getCategoryDomain(data, 'name')).toEqual(['Jan', 'Feb', 'Mar']);
    });
  });

  describe('generateLinearTicks', () => {
    it('should generate ticks with value and coordinate', () => {
      const scale = service.createLinearScale([0, 100], [0, 400]);
      const ticks = service.generateLinearTicks(scale, 5);
      expect(ticks.length).toBeGreaterThan(0);
      ticks.forEach(tick => {
        expect(tick.value).toBeDefined();
        expect(tick.coordinate).toBeDefined();
      });
    });
  });

  describe('generateBandTicks', () => {
    it('should generate ticks centered in each band', () => {
      const scale = service.createBandScale(['A', 'B', 'C'], [0, 300]);
      const ticks = service.generateBandTicks(scale);
      expect(ticks.length).toBe(3);
      expect(ticks[0].value).toBe('A');
      // coordinate should be at band center (start + bandwidth/2)
      const expectedA = (scale('A') || 0) + scale.bandwidth() / 2;
      expect(ticks[0].coordinate).toBeCloseTo(expectedA);
    });
  });
});
