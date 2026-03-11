import { TestBed } from '@angular/core/testing';
import { AreaComponent } from './area.component';
import { ScaleService } from '../services/scale.service';
import { ChartMouseEvent } from '../core/event-types';

describe('AreaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaComponent],
      providers: [ScaleService],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(AreaComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events', () => {
    it('should have areaClick output', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.areaClick).toBeDefined();
    });

    it('should have all 8 mouse event outputs', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.areaClick).toBeDefined();
      expect(comp.areaMouseDown).toBeDefined();
      expect(comp.areaMouseUp).toBeDefined();
      expect(comp.areaMouseMove).toBeDefined();
      expect(comp.areaMouseOver).toBeDefined();
      expect(comp.areaMouseOut).toBeDefined();
      expect(comp.areaMouseEnter).toBeDefined();
      expect(comp.areaMouseLeave).toBeDefined();
    });

    it('should emit ChartMouseEvent on handleAreaClick', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'revenue');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.areaClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

      comp.handleAreaClick(new MouseEvent('click'));

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('revenue');
      expect(emitted[0].index).toBe(0);
    });

    it('should emit ChartMouseEvent on handleAreaMouseEnter', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'sales');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.areaMouseEnter.subscribe((e: ChartMouseEvent) => emitted.push(e));

      comp.handleAreaMouseEnter(new MouseEvent('mouseenter'));

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('sales');
    });
  });

  describe('Computed properties', () => {
    it('should return empty points when no data provided', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.points()).toEqual([]);
    });

    it('should compute points when data, chartWidth, and chartHeight are provided', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('data', [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 200 },
        { name: 'Mar', value: 150 },
      ]);
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.detectChanges();
      const points = fixture.componentInstance.points();
      expect(points.length).toBe(3);
      points.forEach(p => {
        expect(p.x).toBeDefined();
        expect(p.y).toBeDefined();
        expect(p.y0).toBeDefined();
        expect(p.value).toBeDefined();
      });
    });

    it('should return empty linePath when no points', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.linePath()).toBe('');
    });

    it('should compute a non-empty linePath when points exist', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('data', [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
      ]);
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.detectChanges();
      expect(fixture.componentInstance.linePath()).not.toBe('');
    });

    it('should return empty areaPath when no points', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.areaPath()).toBe('');
    });

    it('should compute a non-empty areaPath when points exist', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('data', [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
      ]);
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.detectChanges();
      expect(fixture.componentInstance.areaPath()).not.toBe('');
    });
  });

  describe('hide input', () => {
    it('should default hide to false', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(false);
    });

    it('should respect hide input when set to true', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('hide', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(true);
    });
  });

  describe('type input (curve type)', () => {
    it('should default type to linear', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.type()).toBe('linear');
    });

    it('should accept monotone type', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('type', 'monotone');
      fixture.detectChanges();
      expect(fixture.componentInstance.type()).toBe('monotone');
    });
  });

  describe('connectNulls behavior', () => {
    it('should default connectNulls to false', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.connectNulls()).toBe(false);
    });

    it('should include all points when connectNulls is true and all values are numeric', () => {
      const fixture = TestBed.createComponent(AreaComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('data', [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 200 },
        { name: 'Mar', value: 150 },
      ]);
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.componentRef.setInput('connectNulls', true);
      fixture.detectChanges();
      const points = fixture.componentInstance.points();
      expect(points.length).toBe(3);
    });
  });
});
