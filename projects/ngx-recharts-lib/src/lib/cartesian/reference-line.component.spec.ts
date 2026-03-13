import { TestBed } from '@angular/core/testing';
import { ReferenceLineComponent } from './reference-line.component';
import { ChartMouseEvent } from '../core/event-types';

describe('ReferenceLineComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferenceLineComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ReferenceLineComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events', () => {
    it('should have all 8 mouse event outputs defined', () => {
      const fixture = TestBed.createComponent(ReferenceLineComponent);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.refLineClick).toBeDefined();
      expect(comp.refLineMouseDown).toBeDefined();
      expect(comp.refLineMouseUp).toBeDefined();
      expect(comp.refLineMouseMove).toBeDefined();
      expect(comp.refLineMouseOver).toBeDefined();
      expect(comp.refLineMouseOut).toBeDefined();
      expect(comp.refLineMouseEnter).toBeDefined();
      expect(comp.refLineMouseLeave).toBeDefined();
    });

    it('should emit ChartMouseEvent on handleClick', () => {
      const fixture = TestBed.createComponent(ReferenceLineComponent);
      fixture.componentRef.setInput('x', 100);
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.refLineClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

      comp.handleClick(new MouseEvent('click'));

      expect(emitted.length).toBe(1);
      expect(emitted[0].payload).toEqual({ x: 100, y: undefined });
    });
  });

  describe('lineCoords computed', () => {
    it('should return null when neither x nor y nor segment is set', () => {
      const fixture = TestBed.createComponent(ReferenceLineComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.lineCoords()).toBeNull();
    });

    it('should compute vertical line coords when x is a number', () => {
      const fixture = TestBed.createComponent(ReferenceLineComponent);
      fixture.componentRef.setInput('x', 50);
      fixture.detectChanges();
      const coords = fixture.componentInstance.lineCoords();
      expect(coords).not.toBeNull();
      expect(coords!.x1).toBe(50);
      expect(coords!.x2).toBe(50);
      expect(coords!.y1).toBe(0);
    });

    it('should compute horizontal line coords when y is a number', () => {
      const fixture = TestBed.createComponent(ReferenceLineComponent);
      fixture.componentRef.setInput('y', 75);
      fixture.detectChanges();
      const coords = fixture.componentInstance.lineCoords();
      expect(coords).not.toBeNull();
      expect(coords!.y1).toBe(75);
      expect(coords!.y2).toBe(75);
      expect(coords!.x1).toBe(0);
    });

    it('should compute coords from segment input', () => {
      const fixture = TestBed.createComponent(ReferenceLineComponent);
      fixture.componentRef.setInput('segment', [{ x: 10, y: 20 }, { x: 30, y: 40 }]);
      fixture.detectChanges();
      const coords = fixture.componentInstance.lineCoords();
      expect(coords).toEqual({ x1: 10, y1: 20, x2: 30, y2: 40 });
    });
  });

  describe('label input', () => {
    it('should default label to undefined', () => {
      const fixture = TestBed.createComponent(ReferenceLineComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.label()).toBeUndefined();
    });

    it('should accept label string', () => {
      const fixture = TestBed.createComponent(ReferenceLineComponent);
      fixture.componentRef.setInput('label', 'Max');
      fixture.detectChanges();
      expect(fixture.componentInstance.label()).toBe('Max');
    });
  });

  describe('strokeDasharray input', () => {
    it('should default strokeDasharray to empty string', () => {
      const fixture = TestBed.createComponent(ReferenceLineComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.strokeDasharray()).toBe('');
    });

    it('should accept custom strokeDasharray', () => {
      const fixture = TestBed.createComponent(ReferenceLineComponent);
      fixture.componentRef.setInput('strokeDasharray', '5 5');
      fixture.detectChanges();
      expect(fixture.componentInstance.strokeDasharray()).toBe('5 5');
    });
  });
});
