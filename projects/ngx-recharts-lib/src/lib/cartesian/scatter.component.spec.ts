import { TestBed } from '@angular/core/testing';
import { ScatterComponent } from './scatter.component';
import { ScaleService } from '../services/scale.service';
import { ChartMouseEvent } from '../core/event-types';

describe('ScatterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterComponent],
      providers: [ScaleService],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ScatterComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events', () => {
    it('should have scatterClick output', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.scatterClick).toBeDefined();
    });

    it('should have all 8 mouse event outputs', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.scatterClick).toBeDefined();
      expect(comp.scatterMouseDown).toBeDefined();
      expect(comp.scatterMouseUp).toBeDefined();
      expect(comp.scatterMouseMove).toBeDefined();
      expect(comp.scatterMouseOver).toBeDefined();
      expect(comp.scatterMouseOut).toBeDefined();
      expect(comp.scatterMouseEnter).toBeDefined();
      expect(comp.scatterMouseLeave).toBeDefined();
    });

    it('should emit ChartMouseEvent on handleScatterClick', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.scatterClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

      const point = { x: 10, y: 20, payload: { x: 1, y: 2 } };
      comp.handleScatterClick(new MouseEvent('click'), point, 0);

      expect(emitted.length).toBe(1);
      expect(emitted[0].index).toBe(0);
      expect(emitted[0].payload).toEqual(point.payload);
    });

    it('should emit ChartMouseEvent on handleScatterMouseEnter', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.scatterMouseEnter.subscribe((e: ChartMouseEvent) => emitted.push(e));

      const point = { x: 50, y: 80, payload: { x: 5, y: 8 } };
      comp.handleScatterMouseEnter(new MouseEvent('mouseenter'), point, 1);

      expect(emitted.length).toBe(1);
      expect(emitted[0].index).toBe(1);
      expect(emitted[0].coordinate).toEqual({ x: 50, y: 80 });
    });
  });

  describe('scatterPoints computed', () => {
    it('should return empty scatterPoints when no data provided', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.scatterPoints()).toEqual([]);
    });

    it('should compute scatterPoints when data is provided', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.componentRef.setInput('data', [
        { x: 10, y: 20 },
        { x: 30, y: 50 },
        { x: 50, y: 10 },
      ]);
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.detectChanges();
      const points = fixture.componentInstance.scatterPoints();
      expect(points.length).toBe(3);
      points.forEach(p => {
        expect(p.x).toBeDefined();
        expect(p.y).toBeDefined();
        expect(p.payload).toBeDefined();
      });
    });

    it('should use x and y keys from string dataKey form', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.componentRef.setInput('data', [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
      fixture.componentRef.setInput('dataKey', '');
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.detectChanges();
      const points = fixture.componentInstance.scatterPoints();
      expect(points.length).toBe(2);
    });

    it('should use object dataKey form with x/y keys', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.componentRef.setInput('data', [
        { cx: 10, cy: 20 },
        { cx: 30, cy: 50 },
      ]);
      fixture.componentRef.setInput('dataKey', { x: 'cx', y: 'cy' });
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.detectChanges();
      const points = fixture.componentInstance.scatterPoints();
      expect(points.length).toBe(2);
    });
  });

  describe('hide input', () => {
    it('should default hide to false', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(false);
    });

    it('should respect hide input when set to true', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.componentRef.setInput('hide', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(true);
    });
  });

  describe('shape input', () => {
    it('should default shape to circle', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.shape()).toBe('circle');
    });

    it('should accept cross shape', () => {
      const fixture = TestBed.createComponent(ScatterComponent);
      fixture.componentRef.setInput('shape', 'cross');
      fixture.detectChanges();
      expect(fixture.componentInstance.shape()).toBe('cross');
    });
  });
});
