import { TooltipService } from './tooltip.service';
import { TooltipPayload } from '../component/tooltip.component';

describe('TooltipService', () => {
  let service: TooltipService;

  beforeEach(() => {
    service = new TooltipService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have active as false', () => {
      expect(service.active()).toBeFalse();
    });

    it('should have empty payload', () => {
      expect(service.payload()).toEqual([]);
    });

    it('should have empty label', () => {
      expect(service.label()).toBe('');
    });

    it('should have coordinate at origin', () => {
      expect(service.coordinate()).toEqual({ x: 0, y: 0 });
    });
  });

  describe('showTooltip', () => {
    it('should set active to true and store coordinate, payload, label', () => {
      const payload: TooltipPayload[] = [
        { dataKey: 'value', value: 100, name: 'Value', color: '#8884d8', payload: { name: 'Jan', value: 100 } },
      ];
      service.showTooltip({ x: 50, y: 100 }, payload, 'January');

      expect(service.active()).toBeTrue();
      expect(service.coordinate()).toEqual({ x: 50, y: 100 });
      expect(service.payload()).toEqual(payload);
      expect(service.label()).toBe('January');
    });

    it('should default label to empty string when omitted', () => {
      service.showTooltip({ x: 10, y: 20 }, []);
      expect(service.label()).toBe('');
    });

    it('should update all values when called twice', () => {
      service.showTooltip({ x: 10, y: 20 }, [], 'first');
      service.showTooltip({ x: 30, y: 40 }, [], 'second');

      expect(service.coordinate()).toEqual({ x: 30, y: 40 });
      expect(service.label()).toBe('second');
    });
  });

  describe('hideTooltip', () => {
    it('should set active to false and clear payload and label', () => {
      service.showTooltip({ x: 50, y: 100 }, [
        { dataKey: 'v', value: 1, payload: {} },
      ] as TooltipPayload[], 'test');

      service.hideTooltip();

      expect(service.active()).toBeFalse();
      expect(service.payload()).toEqual([]);
      expect(service.label()).toBe('');
    });

    it('should retain coordinate after hide', () => {
      service.showTooltip({ x: 50, y: 100 }, [], 'test');
      service.hideTooltip();
      expect(service.coordinate()).toEqual({ x: 50, y: 100 });
    });
  });

  describe('updatePosition', () => {
    it('should update only Y coordinate when active', () => {
      service.showTooltip({ x: 50, y: 100 }, [], 'test');
      service.updatePosition({ x: 999, y: 200 });

      expect(service.coordinate()).toEqual({ x: 50, y: 200 });
    });

    it('should not update coordinate when inactive', () => {
      service.updatePosition({ x: 100, y: 200 });
      expect(service.coordinate()).toEqual({ x: 0, y: 0 });
    });
  });

  describe('full lifecycle', () => {
    it('should handle show -> updatePosition -> hide correctly', () => {
      service.showTooltip({ x: 50, y: 100 }, [
        { dataKey: 'v', value: 42, payload: {} },
      ] as TooltipPayload[], 'Point A');

      expect(service.active()).toBeTrue();

      service.updatePosition({ x: 999, y: 150 });
      expect(service.coordinate()).toEqual({ x: 50, y: 150 });

      service.hideTooltip();
      expect(service.active()).toBeFalse();
      expect(service.payload()).toEqual([]);
      expect(service.label()).toBe('');
      expect(service.coordinate()).toEqual({ x: 50, y: 150 });
    });
  });
});
