import { TestBed } from '@angular/core/testing';
import { RadialBarComponent } from './radial-bar.component';
import { ChartMouseEvent } from '../core/event-types';

describe('RadialBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadialBarComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(RadialBarComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events', () => {
    it('should have all 8 mouse event outputs defined', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.radialBarClick).toBeDefined();
      expect(comp.radialBarMouseDown).toBeDefined();
      expect(comp.radialBarMouseUp).toBeDefined();
      expect(comp.radialBarMouseMove).toBeDefined();
      expect(comp.radialBarMouseOver).toBeDefined();
      expect(comp.radialBarMouseOut).toBeDefined();
      expect(comp.radialBarMouseEnter).toBeDefined();
      expect(comp.radialBarMouseLeave).toBeDefined();
    });

    it('should emit ChartMouseEvent on handleRadialBarClick', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'amount');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.radialBarClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

      const barData = {
        innerRadius: 10,
        outerRadius: 30,
        startAngle: 0,
        endAngle: 180,
        fill: '#8884d8',
        name: 'A',
        value: 55,
      };
      comp.handleRadialBarClick(new MouseEvent('click'), barData, 0);

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('amount');
      expect(emitted[0].index).toBe(0);
      expect(emitted[0].value).toBe(55);
      expect(emitted[0].payload).toBe(barData);
    });

    it('should emit ChartMouseEvent on handleRadialBarMouseEnter', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'count');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.radialBarMouseEnter.subscribe((e: ChartMouseEvent) => emitted.push(e));

      const barData = {
        innerRadius: 0,
        outerRadius: 50,
        startAngle: 0,
        endAngle: 90,
        fill: '#8884d8',
        name: 'B',
        value: 20,
      };
      comp.handleRadialBarMouseEnter(new MouseEvent('mouseenter'), barData, 1);

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('count');
      expect(emitted[0].index).toBe(1);
    });
  });

  describe('cornerRadius input', () => {
    it('should default cornerRadius to 0', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.cornerRadius()).toBe(0);
    });

    it('should accept custom cornerRadius', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('cornerRadius', 8);
      fixture.detectChanges();
      expect(fixture.componentInstance.cornerRadius()).toBe(8);
    });
  });

  describe('background input', () => {
    it('should default background to false', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.background()).toBe(false);
    });

    it('should accept background set to true', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('background', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.background()).toBe(true);
    });
  });

  describe('hide input', () => {
    it('should default hide to false', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(false);
    });

    it('should respect hide input when set to true', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('hide', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(true);
    });
  });

  describe('minAngle input', () => {
    it('should default minAngle to 0', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.minAngle()).toBe(0);
    });

    it('should accept custom minAngle', () => {
      const fixture = TestBed.createComponent(RadialBarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('minAngle', 15);
      fixture.detectChanges();
      expect(fixture.componentInstance.minAngle()).toBe(15);
    });
  });
});
