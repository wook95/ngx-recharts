import { TestBed } from '@angular/core/testing';
import { RadarComponent } from './radar.component';
import { ChartMouseEvent } from '../core/event-types';

describe('RadarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(RadarComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events', () => {
    it('should have all 8 mouse event outputs defined', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.radarClick).toBeDefined();
      expect(comp.radarMouseDown).toBeDefined();
      expect(comp.radarMouseUp).toBeDefined();
      expect(comp.radarMouseMove).toBeDefined();
      expect(comp.radarMouseOver).toBeDefined();
      expect(comp.radarMouseOut).toBeDefined();
      expect(comp.radarMouseEnter).toBeDefined();
      expect(comp.radarMouseLeave).toBeDefined();
    });

    it('should emit ChartMouseEvent on handleRadarClick', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'score');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.radarClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

      comp.handleRadarClick(new MouseEvent('click'));

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('score');
      expect(emitted[0].index).toBe(0);
    });

    it('should emit ChartMouseEvent on handleRadarMouseEnter', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.radarMouseEnter.subscribe((e: ChartMouseEvent) => emitted.push(e));

      comp.handleRadarMouseEnter(new MouseEvent('mouseenter'));

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('value');
    });
  });

  describe('shape input', () => {
    it('should default shape to "polygon"', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.shape()).toBe('polygon');
    });

    it('should accept shape set to "circle"', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('shape', 'circle');
      fixture.detectChanges();
      expect(fixture.componentInstance.shape()).toBe('circle');
    });
  });

  describe('dot and activeDot inputs', () => {
    it('should default dot to false', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.dot()).toBe(false);
    });

    it('should accept dot set to true', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('dot', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.dot()).toBe(true);
    });

    it('should default activeDot to false', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.activeDot()).toBe(false);
    });
  });

  describe('fill and stroke inputs', () => {
    it('should default fill to "#8884d8"', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.fill()).toBe('#8884d8');
    });

    it('should accept custom fill', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('fill', '#ff0000');
      fixture.detectChanges();
      expect(fixture.componentInstance.fill()).toBe('#ff0000');
    });

    it('should default stroke to "#8884d8"', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.stroke()).toBe('#8884d8');
    });

    it('should accept custom stroke', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('stroke', '#00ff00');
      fixture.detectChanges();
      expect(fixture.componentInstance.stroke()).toBe('#00ff00');
    });
  });

  describe('hide input', () => {
    it('should default hide to false', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(false);
    });

    it('should respect hide input when set to true', () => {
      const fixture = TestBed.createComponent(RadarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('hide', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(true);
    });
  });
});
