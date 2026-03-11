import { AxisRegistryService, AxisRegistration } from './axis-registry.service';

describe('AxisRegistryService', () => {
  let service: AxisRegistryService;

  beforeEach(() => {
    service = new AxisRegistryService();
  });

  function makeAxis(overrides: Partial<AxisRegistration> = {}): AxisRegistration {
    return {
      axisId: '0',
      type: 'x',
      scale: (v: number) => v,
      domain: [0, 100] as [number, number],
      range: [0, 400] as [number, number],
      ticks: [0, 25, 50, 75, 100],
      ...overrides,
    };
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty axes map', () => {
    expect(service.axes().size).toBe(0);
  });

  describe('registerAxis / unregisterAxis', () => {
    it('should register an axis and store it with composite key', () => {
      service.registerAxis(makeAxis({ type: 'x', axisId: '0' }));
      expect(service.axes().size).toBe(1);
      expect(service.axes().has('x-0')).toBeTrue();
    });

    it('should register multiple axes of different types', () => {
      service.registerAxis(makeAxis({ type: 'x', axisId: '0' }));
      service.registerAxis(makeAxis({ type: 'y', axisId: '0' }));
      service.registerAxis(makeAxis({ type: 'z', axisId: '0' }));
      expect(service.axes().size).toBe(3);
    });

    it('should unregister an axis by type and axisId', () => {
      service.registerAxis(makeAxis({ type: 'x', axisId: '0' }));
      service.unregisterAxis('x', '0');
      expect(service.axes().size).toBe(0);
    });

    it('should not throw when unregistering a non-existent axis', () => {
      expect(() => service.unregisterAxis('x', '99')).not.toThrow();
    });
  });

  describe('getXAxis / getYAxis / getZAxis', () => {
    it('should retrieve x-axis by default id', () => {
      const axis = makeAxis({ type: 'x', axisId: '0' });
      service.registerAxis(axis);
      expect(service.getXAxis()).toEqual(axis);
    });

    it('should retrieve y-axis by custom id', () => {
      const axis = makeAxis({ type: 'y', axisId: 'right' });
      service.registerAxis(axis);
      expect(service.getYAxis('right')).toEqual(axis);
    });

    it('should retrieve z-axis by default id', () => {
      const axis = makeAxis({ type: 'z', axisId: '0' });
      service.registerAxis(axis);
      expect(service.getZAxis()).toEqual(axis);
    });

    it('should return undefined for unregistered axis', () => {
      expect(service.getXAxis()).toBeUndefined();
      expect(service.getYAxis()).toBeUndefined();
      expect(service.getZAxis()).toBeUndefined();
    });
  });

  describe('getXAxisScale / getYAxisScale', () => {
    it('should return the scale function for registered x-axis', () => {
      const mockScale = (v: number) => v * 2;
      service.registerAxis(makeAxis({ type: 'x', axisId: '0', scale: mockScale }));
      expect(service.getXAxisScale()).toBe(mockScale);
    });

    it('should return the scale function for registered y-axis', () => {
      const mockScale = (v: number) => v * 3;
      service.registerAxis(makeAxis({ type: 'y', axisId: '0', scale: mockScale }));
      expect(service.getYAxisScale()).toBe(mockScale);
    });

    it('should return undefined when axis not registered', () => {
      expect(service.getXAxisScale()).toBeUndefined();
      expect(service.getYAxisScale()).toBeUndefined();
    });
  });

  describe('getXAxisDomain / getYAxisDomain', () => {
    it('should return domain tuple for registered x-axis', () => {
      service.registerAxis(makeAxis({ type: 'x', axisId: '0', domain: [0, 500] }));
      expect(service.getXAxisDomain()).toEqual([0, 500]);
    });

    it('should return domain tuple for registered y-axis', () => {
      service.registerAxis(makeAxis({ type: 'y', axisId: '0', domain: [-100, 100] }));
      expect(service.getYAxisDomain()).toEqual([-100, 100]);
    });

    it('should return undefined for missing axes', () => {
      expect(service.getXAxisDomain()).toBeUndefined();
      expect(service.getYAxisDomain()).toBeUndefined();
    });
  });

  describe('getXAxisTicks / getYAxisTicks', () => {
    it('should return ticks array for registered x-axis', () => {
      service.registerAxis(makeAxis({ type: 'x', axisId: '0', ticks: [10, 20, 30] }));
      expect(service.getXAxisTicks()).toEqual([10, 20, 30]);
    });

    it('should return ticks array for registered y-axis', () => {
      service.registerAxis(makeAxis({ type: 'y', axisId: '0', ticks: [0, 50, 100] }));
      expect(service.getYAxisTicks()).toEqual([0, 50, 100]);
    });

    it('should return empty array when axis not registered', () => {
      expect(service.getXAxisTicks()).toEqual([]);
      expect(service.getYAxisTicks()).toEqual([]);
    });
  });

  describe('optional fields', () => {
    it('should preserve optional dataKey and orientation', () => {
      const axis = makeAxis({ type: 'x', axisId: '0', dataKey: 'time', orientation: 'bottom' });
      service.registerAxis(axis);
      const retrieved = service.getXAxis();
      expect(retrieved?.dataKey).toBe('time');
      expect(retrieved?.orientation).toBe('bottom');
    });
  });

  describe('overwrite behavior', () => {
    it('should overwrite previous entry when re-registering same type-axisId', () => {
      service.registerAxis(makeAxis({ type: 'x', axisId: '0', domain: [0, 100] }));
      service.registerAxis(makeAxis({ type: 'x', axisId: '0', domain: [0, 999] }));
      expect(service.axes().size).toBe(1);
      expect(service.getXAxisDomain()).toEqual([0, 999]);
    });
  });
});
