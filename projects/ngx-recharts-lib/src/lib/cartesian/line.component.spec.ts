import { TestBed } from '@angular/core/testing';
import { LineComponent } from './line.component';
import { ScaleService } from '../services/scale.service';
import { ChartMouseEvent } from '../core/event-types';

describe('LineComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineComponent],
      providers: [ScaleService],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(LineComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events (preferred API)', () => {
    it('should have lineClick output', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.lineClick).toBeDefined();
    });

    it('should have all mouse event outputs', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.lineMouseDown).toBeDefined();
      expect(comp.lineMouseUp).toBeDefined();
      expect(comp.lineMouseMove).toBeDefined();
      expect(comp.lineMouseOver).toBeDefined();
      expect(comp.lineMouseOut).toBeDefined();
      expect(comp.lineMouseEnter).toBeDefined();
      expect(comp.lineMouseLeave).toBeDefined();
    });

    it('should emit lineClick with ChartMouseEvent on handleClick', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'revenue');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.lineClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

      comp.handleClick(new MouseEvent('click'));

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('revenue');
      expect(emitted[0].index).toBe(0);
    });

    it('should emit lineMouseEnter on handleMouseEnter', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'sales');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.lineMouseEnter.subscribe((e: ChartMouseEvent) => emitted.push(e));

      comp.handleMouseEnter(new MouseEvent('mouseenter'));
      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('sales');
    });
  });

  describe('Deprecated input API', () => {
    it('should have onClick deprecated input', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      // onClick is an input signal — it should exist and return undefined by default
      expect(fixture.componentInstance.onClick()).toBeUndefined();
    });

    it('should call onClick handler when handleClick is invoked', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      const clickSpy = jasmine.createSpy('onClick');
      fixture.componentRef.setInput('onClick', clickSpy);
      fixture.detectChanges();

      const event = new MouseEvent('click');
      fixture.componentInstance.handleClick(event);

      expect(clickSpy).toHaveBeenCalledWith(event);
    });

    it('should call onMouseLeave handler when handleMouseLeave is invoked', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      const leaveSpy = jasmine.createSpy('onMouseLeave');
      fixture.componentRef.setInput('onMouseLeave', leaveSpy);
      fixture.detectChanges();

      const event = new MouseEvent('mouseleave');
      fixture.componentInstance.handleMouseLeave(event);

      expect(leaveSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('Computed properties', () => {
    it('should return empty finalPoints when no data provided', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.finalPoints()).toEqual([]);
    });

    it('should compute finalPoints when data is provided', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('data', [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 200 },
        { name: 'Mar', value: 150 },
      ]);
      fixture.componentRef.setInput('chartWidth', 400);
      fixture.componentRef.setInput('chartHeight', 300);
      fixture.detectChanges();
      const points = fixture.componentInstance.finalPoints();
      expect(points.length).toBe(3);
      points.forEach(p => {
        expect(p.x).toBeDefined();
        expect(p.y).toBeDefined();
        expect(p.value).toBeDefined();
      });
    });

    it('should use provided points over calculated points', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      const manualPoints = [
        { x: 10, y: 20, value: 100, payload: { name: 'A', value: 100 } },
        { x: 50, y: 80, value: 200, payload: { name: 'B', value: 200 } },
      ];
      fixture.componentRef.setInput('points', manualPoints);
      fixture.detectChanges();
      expect(fixture.componentInstance.finalPoints()).toEqual(manualPoints);
    });

    it('should return empty linePath when no points', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.linePath()).toBe('');
    });

    it('should compute a non-empty linePath when points exist', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('points', [
        { x: 0, y: 100, value: 100, payload: { name: 'A', value: 100 } },
        { x: 100, y: 50, value: 200, payload: { name: 'B', value: 200 } },
      ]);
      fixture.detectChanges();
      expect(fixture.componentInstance.linePath()).not.toBe('');
    });

    it('getActivePoint should return null when no tooltip service', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.getActivePoint()).toBeNull();
    });
  });

  describe('stroke and strokeWidth inputs', () => {
    it('should default stroke to #3182bd and strokeWidth to 1', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.stroke()).toBe('#3182bd');
      expect(comp.strokeWidth()).toBe(1);
    });

    it('should accept custom stroke and strokeWidth', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('stroke', '#ff6600');
      fixture.componentRef.setInput('strokeWidth', 3);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.stroke()).toBe('#ff6600');
      expect(comp.strokeWidth()).toBe(3);
    });
  });

  describe('hide input', () => {
    it('should default hide to false', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(false);
    });

    it('should respect hide input when set to true', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('hide', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(true);
    });
  });

  describe('dot input', () => {
    it('should default dot to true (dots shown)', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.shouldShowDots()).toBe(true);
    });

    it('should hide dots when dot is false', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('dot', false);
      fixture.detectChanges();
      expect(fixture.componentInstance.shouldShowDots()).toBe(false);
    });
  });

  describe('type input (curve type)', () => {
    it('should default type to linear', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.type()).toBe('linear');
    });

    it('should accept monotone type', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('type', 'monotone');
      fixture.detectChanges();
      expect(fixture.componentInstance.type()).toBe('monotone');
    });

    it('should accept step type', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('type', 'step');
      fixture.detectChanges();
      expect(fixture.componentInstance.type()).toBe('step');
    });
  });

  describe('connectNulls input', () => {
    it('should default connectNulls to false', () => {
      const fixture = TestBed.createComponent(LineComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.connectNulls()).toBe(false);
    });

    it('should include all numeric points when connectNulls is true', () => {
      const fixture = TestBed.createComponent(LineComponent);
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
      const points = fixture.componentInstance.finalPoints();
      expect(points.length).toBe(3);
    });
  });
});
