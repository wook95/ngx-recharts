import { TestBed } from '@angular/core/testing';
import { ReferenceAreaComponent } from './reference-area.component';
import { ChartMouseEvent } from '../core/event-types';

describe('ReferenceAreaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferenceAreaComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ReferenceAreaComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events', () => {
    it('should have all 8 mouse event outputs defined', () => {
      const fixture = TestBed.createComponent(ReferenceAreaComponent);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.refAreaClick).toBeDefined();
      expect(comp.refAreaMouseDown).toBeDefined();
      expect(comp.refAreaMouseUp).toBeDefined();
      expect(comp.refAreaMouseMove).toBeDefined();
      expect(comp.refAreaMouseOver).toBeDefined();
      expect(comp.refAreaMouseOut).toBeDefined();
      expect(comp.refAreaMouseEnter).toBeDefined();
      expect(comp.refAreaMouseLeave).toBeDefined();
    });

    it('should emit ChartMouseEvent on handleClick', () => {
      const fixture = TestBed.createComponent(ReferenceAreaComponent);
      fixture.componentRef.setInput('x1', 10);
      fixture.componentRef.setInput('x2', 50);
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.refAreaClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

      comp.handleClick(new MouseEvent('click'));

      expect(emitted.length).toBe(1);
      expect(emitted[0].payload).toEqual({ x1: 10, x2: 50, y1: undefined, y2: undefined });
    });
  });

  describe('x1/x2/y1/y2 inputs', () => {
    it('should default all boundary inputs to undefined', () => {
      const fixture = TestBed.createComponent(ReferenceAreaComponent);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.x1()).toBeUndefined();
      expect(comp.x2()).toBeUndefined();
      expect(comp.y1()).toBeUndefined();
      expect(comp.y2()).toBeUndefined();
    });

    it('should accept x1 and x2 numeric inputs', () => {
      const fixture = TestBed.createComponent(ReferenceAreaComponent);
      fixture.componentRef.setInput('x1', 20);
      fixture.componentRef.setInput('x2', 80);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.x1()).toBe(20);
      expect(comp.x2()).toBe(80);
    });

    it('should accept y1 and y2 numeric inputs', () => {
      const fixture = TestBed.createComponent(ReferenceAreaComponent);
      fixture.componentRef.setInput('y1', 30);
      fixture.componentRef.setInput('y2', 90);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.y1()).toBe(30);
      expect(comp.y2()).toBe(90);
    });
  });

  describe('fill and fillOpacity inputs', () => {
    it('should default fill to #ccc', () => {
      const fixture = TestBed.createComponent(ReferenceAreaComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.fill()).toBe('#ccc');
    });

    it('should default fillOpacity to 0.5', () => {
      const fixture = TestBed.createComponent(ReferenceAreaComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.fillOpacity()).toBe(0.5);
    });

    it('should accept custom fill and fillOpacity', () => {
      const fixture = TestBed.createComponent(ReferenceAreaComponent);
      fixture.componentRef.setInput('fill', 'blue');
      fixture.componentRef.setInput('fillOpacity', 0.8);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.fill()).toBe('blue');
      expect(comp.fillOpacity()).toBe(0.8);
    });
  });

  describe('label input', () => {
    it('should default label to undefined', () => {
      const fixture = TestBed.createComponent(ReferenceAreaComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.label()).toBeUndefined();
    });

    it('should accept label string', () => {
      const fixture = TestBed.createComponent(ReferenceAreaComponent);
      fixture.componentRef.setInput('label', 'Zone A');
      fixture.detectChanges();
      expect(fixture.componentInstance.label()).toBe('Zone A');
    });
  });
});
