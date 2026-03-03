import { ChartMouseEvent, LegendClickEvent, BarClickEvent, LineClickEvent } from './event-types';

describe('Event Types', () => {
  describe('ChartMouseEvent', () => {
    it('should create a ChartMouseEvent with required fields', () => {
      const event: ChartMouseEvent = {
        nativeEvent: new MouseEvent('click'),
        payload: { name: 'test', value: 42 },
        index: 0,
      };
      expect(event.payload.name).toBe('test');
      expect(event.index).toBe(0);
    });

    it('should support generic payload type', () => {
      const event: ChartMouseEvent<{ x: number; y: number }> = {
        nativeEvent: new MouseEvent('click'),
        payload: { x: 10, y: 20 },
        index: 1,
      };
      expect(event.payload.x).toBe(10);
      expect(event.payload.y).toBe(20);
    });

    it('should accept optional fields dataKey, value, and coordinate', () => {
      const event: ChartMouseEvent = {
        nativeEvent: new MouseEvent('mousemove'),
        payload: { name: 'Jan', revenue: 500 },
        index: 2,
        dataKey: 'revenue',
        value: 500,
        coordinate: { x: 120, y: 80 },
      };
      expect(event.dataKey).toBe('revenue');
      expect(event.value).toBe(500);
      expect(event.coordinate?.x).toBe(120);
    });

    it('should work without optional fields', () => {
      const event: ChartMouseEvent = {
        nativeEvent: new MouseEvent('click'),
        payload: null,
        index: -1,
      };
      expect(event.dataKey).toBeUndefined();
      expect(event.coordinate).toBeUndefined();
    });
  });

  describe('LegendClickEvent', () => {
    it('should create a LegendClickEvent with all required fields', () => {
      const event: LegendClickEvent = {
        dataKey: 'revenue',
        type: 'line',
        color: '#8884d8',
        inactive: false,
        index: 0,
      };
      expect(event.dataKey).toBe('revenue');
      expect(event.type).toBe('line');
      expect(event.color).toBe('#8884d8');
      expect(event.inactive).toBe(false);
    });

    it('should support inactive state', () => {
      const event: LegendClickEvent = {
        dataKey: 'cost',
        type: 'bar',
        color: '#82ca9d',
        inactive: true,
        index: 1,
      };
      expect(event.inactive).toBe(true);
      expect(event.index).toBe(1);
    });
  });

  describe('Type aliases', () => {
    it('BarClickEvent should be assignable as ChartMouseEvent', () => {
      const event: BarClickEvent<{ name: string; value: number }> = {
        nativeEvent: new MouseEvent('click'),
        payload: { name: 'Q1', value: 100 },
        index: 0,
        dataKey: 'value',
      };
      const asBase: ChartMouseEvent = event;
      expect(asBase.index).toBe(0);
    });

    it('LineClickEvent should be assignable as ChartMouseEvent', () => {
      const event: LineClickEvent = {
        nativeEvent: new MouseEvent('click'),
        payload: { name: 'Jan' },
        index: 3,
      };
      expect(event.index).toBe(3);
    });
  });
});
