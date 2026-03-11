import { TestBed } from '@angular/core/testing';
import { ReferenceDotComponent } from './reference-dot.component';
import { ChartMouseEvent } from '../core/event-types';

describe('ReferenceDotComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferenceDotComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ReferenceDotComponent);
    fixture.componentRef.setInput('x', 50);
    fixture.componentRef.setInput('y', 100);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events', () => {
    it('should have all 8 mouse event outputs defined', () => {
      const fixture = TestBed.createComponent(ReferenceDotComponent);
      fixture.componentRef.setInput('x', 50);
      fixture.componentRef.setInput('y', 100);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.refDotClick).toBeDefined();
      expect(comp.refDotMouseDown).toBeDefined();
      expect(comp.refDotMouseUp).toBeDefined();
      expect(comp.refDotMouseMove).toBeDefined();
      expect(comp.refDotMouseOver).toBeDefined();
      expect(comp.refDotMouseOut).toBeDefined();
      expect(comp.refDotMouseEnter).toBeDefined();
      expect(comp.refDotMouseLeave).toBeDefined();
    });

    it('should emit ChartMouseEvent on handleClick', () => {
      const fixture = TestBed.createComponent(ReferenceDotComponent);
      fixture.componentRef.setInput('x', 10);
      fixture.componentRef.setInput('y', 20);
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.refDotClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

      comp.handleClick(new MouseEvent('click'));

      expect(emitted.length).toBe(1);
      expect(emitted[0].payload).toEqual({ x: 10, y: 20 });
    });
  });

  describe('Required inputs x and y', () => {
    it('should reflect x and y inputs', () => {
      const fixture = TestBed.createComponent(ReferenceDotComponent);
      fixture.componentRef.setInput('x', 42);
      fixture.componentRef.setInput('y', 84);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.x()).toBe(42);
      expect(comp.y()).toBe(84);
    });
  });

  describe('r, fill and stroke inputs', () => {
    it('should default r to 10', () => {
      const fixture = TestBed.createComponent(ReferenceDotComponent);
      fixture.componentRef.setInput('x', 0);
      fixture.componentRef.setInput('y', 0);
      fixture.detectChanges();
      expect(fixture.componentInstance.r()).toBe(10);
    });

    it('should default fill to #fff', () => {
      const fixture = TestBed.createComponent(ReferenceDotComponent);
      fixture.componentRef.setInput('x', 0);
      fixture.componentRef.setInput('y', 0);
      fixture.detectChanges();
      expect(fixture.componentInstance.fill()).toBe('#fff');
    });

    it('should default stroke to #ccc', () => {
      const fixture = TestBed.createComponent(ReferenceDotComponent);
      fixture.componentRef.setInput('x', 0);
      fixture.componentRef.setInput('y', 0);
      fixture.detectChanges();
      expect(fixture.componentInstance.stroke()).toBe('#ccc');
    });

    it('should accept custom r, fill, and stroke', () => {
      const fixture = TestBed.createComponent(ReferenceDotComponent);
      fixture.componentRef.setInput('x', 0);
      fixture.componentRef.setInput('y', 0);
      fixture.componentRef.setInput('r', 15);
      fixture.componentRef.setInput('fill', 'red');
      fixture.componentRef.setInput('stroke', 'blue');
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.r()).toBe(15);
      expect(comp.fill()).toBe('red');
      expect(comp.stroke()).toBe('blue');
    });
  });

  describe('label input', () => {
    it('should default label to undefined', () => {
      const fixture = TestBed.createComponent(ReferenceDotComponent);
      fixture.componentRef.setInput('x', 0);
      fixture.componentRef.setInput('y', 0);
      fixture.detectChanges();
      expect(fixture.componentInstance.label()).toBeUndefined();
    });

    it('should accept label string', () => {
      const fixture = TestBed.createComponent(ReferenceDotComponent);
      fixture.componentRef.setInput('x', 0);
      fixture.componentRef.setInput('y', 0);
      fixture.componentRef.setInput('label', 'Peak');
      fixture.detectChanges();
      expect(fixture.componentInstance.label()).toBe('Peak');
    });
  });
});
