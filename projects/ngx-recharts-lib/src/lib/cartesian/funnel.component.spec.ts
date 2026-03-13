import { TestBed } from '@angular/core/testing';
import { FunnelComponent } from './funnel.component';
import { ChartMouseEvent } from '../core/event-types';

describe('FunnelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunnelComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(FunnelComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events', () => {
    it('should have all 8 mouse event outputs defined', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.funnelClick).toBeDefined();
      expect(comp.funnelMouseDown).toBeDefined();
      expect(comp.funnelMouseUp).toBeDefined();
      expect(comp.funnelMouseMove).toBeDefined();
      expect(comp.funnelMouseOver).toBeDefined();
      expect(comp.funnelMouseOut).toBeDefined();
      expect(comp.funnelMouseEnter).toBeDefined();
      expect(comp.funnelMouseLeave).toBeDefined();
    });

    it('should emit ChartMouseEvent on handleFunnelClick', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.funnelClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

      const segment = { x: 0, y: 0, upperWidth: 100, lowerWidth: 80, height: 50, fill: '#8884d8', value: 500, name: 'Step 1' };
      comp.handleFunnelClick(new MouseEvent('click'), segment, 0);

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('value');
      expect(emitted[0].payload).toEqual(segment);
      expect(emitted[0].index).toBe(0);
      expect(emitted[0].value).toBe(500);
    });

    it('should emit ChartMouseEvent on handleFunnelMouseEnter', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'sales');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.funnelMouseEnter.subscribe((e: ChartMouseEvent) => emitted.push(e));

      const segment = { x: 0, y: 50, upperWidth: 80, lowerWidth: 60, height: 50, fill: '#8884d8', value: 300, name: 'Step 2' };
      comp.handleFunnelMouseEnter(new MouseEvent('mouseenter'), segment, 1);

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('sales');
      expect(emitted[0].index).toBe(1);
      expect(emitted[0].value).toBe(300);
    });
  });

  describe('segments computed property', () => {
    it('should return empty segments when no data is provided', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.segments()).toEqual([]);
    });

    it('should compute segments when data is provided', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('data', [
        { name: 'Step 1', value: 500 },
        { name: 'Step 2', value: 300 },
        { name: 'Step 3', value: 100 },
      ]);
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.detectChanges();
      const segments = fixture.componentInstance.segments();
      expect(segments.length).toBe(3);
      segments.forEach(seg => {
        expect(seg.upperWidth).toBeGreaterThan(0);
        expect(seg.height).toBeGreaterThan(0);
        expect(seg.fill).toBeTruthy();
      });
    });

    it('should sort segments descending by value (largest first)', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('data', [
        { name: 'Small', value: 100 },
        { name: 'Large', value: 500 },
        { name: 'Medium', value: 300 },
      ]);
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.detectChanges();
      const segments = fixture.componentInstance.segments();
      expect(segments[0].value).toBe(500);
      expect(segments[1].value).toBe(300);
      expect(segments[2].value).toBe(100);
    });
  });

  describe('nameKey input', () => {
    it('should use nameKey to resolve segment names', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'count');
      fixture.componentRef.setInput('nameKey', 'label');
      fixture.componentRef.setInput('data', [
        { label: 'Awareness', count: 1000 },
        { label: 'Interest', count: 600 },
      ]);
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.detectChanges();
      const segments = fixture.componentInstance.segments();
      expect(segments[0].name).toBe('Awareness');
      expect(segments[1].name).toBe('Interest');
    });
  });

  describe('lastShapeType input', () => {
    it('should default lastShapeType to rectangle', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.lastShapeType()).toBe('rectangle');
    });

    it('should accept trapezoid as lastShapeType', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('lastShapeType', 'trapezoid');
      fixture.detectChanges();
      expect(fixture.componentInstance.lastShapeType()).toBe('trapezoid');
    });
  });

  describe('hide input', () => {
    it('should default hide to false', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(false);
    });

    it('should respect hide input when set to true', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('hide', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(true);
    });
  });

  describe('label input', () => {
    it('should default label to false', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.label()).toBe(false);
    });

    it('should accept label set to true', () => {
      const fixture = TestBed.createComponent(FunnelComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('label', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.label()).toBe(true);
    });
  });
});
