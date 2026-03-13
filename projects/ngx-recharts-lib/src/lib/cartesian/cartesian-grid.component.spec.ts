import { TestBed } from '@angular/core/testing';
import { CartesianGridComponent } from './cartesian-grid.component';

describe('CartesianGridComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartesianGridComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(CartesianGridComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('horizontal and vertical toggles', () => {
    it('should default horizontal to true', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.horizontal()).toBe(true);
    });

    it('should default vertical to true', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.vertical()).toBe(true);
    });

    it('should accept horizontal set to false', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.componentRef.setInput('horizontal', false);
      fixture.detectChanges();
      expect(fixture.componentInstance.horizontal()).toBe(false);
    });

    it('should accept vertical set to false', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.componentRef.setInput('vertical', false);
      fixture.detectChanges();
      expect(fixture.componentInstance.vertical()).toBe(false);
    });
  });

  describe('horizontalPoints and verticalPoints inputs', () => {
    it('should use provided horizontalPoints', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.componentRef.setInput('horizontalPoints', [50, 100, 150]);
      fixture.detectChanges();
      expect(fixture.componentInstance.computedHorizontalPoints()).toEqual([50, 100, 150]);
    });

    it('should use provided verticalPoints', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.componentRef.setInput('verticalPoints', [80, 160, 240]);
      fixture.detectChanges();
      expect(fixture.componentInstance.computedVerticalPoints()).toEqual([80, 160, 240]);
    });
  });

  describe('strokeDasharray input', () => {
    it('should default strokeDasharray to "3 3"', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.strokeDasharray()).toBe('3 3');
    });

    it('should accept custom strokeDasharray', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.componentRef.setInput('strokeDasharray', '5 10');
      fixture.detectChanges();
      expect(fixture.componentInstance.strokeDasharray()).toBe('5 10');
    });
  });

  describe('stroke input', () => {
    it('should default stroke to #ccc', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.stroke()).toBe('#ccc');
    });

    it('should accept custom stroke color', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.componentRef.setInput('stroke', '#999');
      fixture.detectChanges();
      expect(fixture.componentInstance.stroke()).toBe('#999');
    });
  });

  describe('x, y, width, height inputs', () => {
    it('should default x and y to 0', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.x()).toBe(0);
      expect(comp.y()).toBe(0);
    });

    it('should accept custom x and y', () => {
      const fixture = TestBed.createComponent(CartesianGridComponent);
      fixture.componentRef.setInput('x', 10);
      fixture.componentRef.setInput('y', 20);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.x()).toBe(10);
      expect(comp.y()).toBe(20);
    });
  });
});
