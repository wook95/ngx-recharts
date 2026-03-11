import { TestBed } from '@angular/core/testing';
import { PieComponent } from './pie.component';
import { ChartMouseEvent } from '../core/event-types';

describe('PieComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(PieComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events', () => {
    it('should have all 8 mouse event outputs defined', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.pieClick).toBeDefined();
      expect(comp.pieMouseDown).toBeDefined();
      expect(comp.pieMouseUp).toBeDefined();
      expect(comp.pieMouseMove).toBeDefined();
      expect(comp.pieMouseOver).toBeDefined();
      expect(comp.pieMouseOut).toBeDefined();
      expect(comp.pieMouseEnter).toBeDefined();
      expect(comp.pieMouseLeave).toBeDefined();
    });

    it('should emit ChartMouseEvent on handleSectorClick', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'revenue');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.pieClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

      const sectorData = { value: 42, name: 'A' };
      comp.handleSectorClick(new MouseEvent('click'), sectorData, 0);

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('revenue');
      expect(emitted[0].index).toBe(0);
      expect(emitted[0].value).toBe(42);
      expect(emitted[0].payload).toBe(sectorData);
    });

    it('should emit ChartMouseEvent on handleSectorMouseEnter', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'sales');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.pieMouseEnter.subscribe((e: ChartMouseEvent) => emitted.push(e));

      const sectorData = { value: 10 };
      comp.handleSectorMouseEnter(new MouseEvent('mouseenter'), sectorData, 1);

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('sales');
      expect(emitted[0].index).toBe(1);
    });
  });

  describe('Computed sectors', () => {
    it('should return empty sectors when no data provided', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.sectors()).toEqual([]);
    });

    it('should compute sectors when data is provided', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('data', [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
      ]);
      fixture.detectChanges();
      const sectors = fixture.componentInstance.sectors();
      expect(sectors.length).toBe(2);
    });
  });

  describe('innerRadius and outerRadius inputs', () => {
    it('should default innerRadius to 0', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.innerRadius()).toBe(0);
    });

    it('should accept custom innerRadius', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('innerRadius', 40);
      fixture.detectChanges();
      expect(fixture.componentInstance.innerRadius()).toBe(40);
    });

    it('should use custom outerRadius when set', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('outerRadius', 120);
      fixture.detectChanges();
      expect(fixture.componentInstance.outerRadius()).toBe(120);
    });
  });

  describe('startAngle and endAngle inputs', () => {
    it('should default startAngle to 0', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.startAngle()).toBe(0);
    });

    it('should default endAngle to 360', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.endAngle()).toBe(360);
    });

    it('should accept custom startAngle and endAngle', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('startAngle', 90);
      fixture.componentRef.setInput('endAngle', 270);
      fixture.detectChanges();
      expect(fixture.componentInstance.startAngle()).toBe(90);
      expect(fixture.componentInstance.endAngle()).toBe(270);
    });
  });

  describe('paddingAngle input', () => {
    it('should default paddingAngle to 0', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.paddingAngle()).toBe(0);
    });

    it('should accept custom paddingAngle', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('paddingAngle', 5);
      fixture.detectChanges();
      expect(fixture.componentInstance.paddingAngle()).toBe(5);
    });
  });

  describe('nameKey input', () => {
    it('should default nameKey to "name"', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.nameKey()).toBe('name');
    });

    it('should accept custom nameKey', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('nameKey', 'label');
      fixture.detectChanges();
      expect(fixture.componentInstance.nameKey()).toBe('label');
    });
  });

  describe('hide input', () => {
    it('should default hide to false', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(false);
    });

    it('should respect hide input when set to true', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('hide', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(true);
    });
  });

  describe('label input', () => {
    it('should default label to false', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.label()).toBe(false);
    });

    it('should accept label set to true', () => {
      const fixture = TestBed.createComponent(PieComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('label', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.label()).toBe(true);
    });
  });
});
