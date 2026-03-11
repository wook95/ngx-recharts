import { TestBed } from '@angular/core/testing';
import { CurveComponent, CurvePoint } from './curve.component';

describe('CurveComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurveComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(CurveComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render a path when points is empty', () => {
    const fixture = TestBed.createComponent(CurveComponent);
    fixture.componentRef.setInput('points', []);
    fixture.detectChanges();

    expect(fixture.componentInstance.pathData()).toBe('');
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('should render a path when points are provided', () => {
    const fixture = TestBed.createComponent(CurveComponent);
    const points: CurvePoint[] = [{ x: 0, y: 0 }, { x: 50, y: 25 }, { x: 100, y: 50 }];
    fixture.componentRef.setInput('points', points);
    fixture.detectChanges();

    expect(fixture.componentInstance.pathData()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('should produce a line path with linear curve type', () => {
    const fixture = TestBed.createComponent(CurveComponent);
    const points: CurvePoint[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    fixture.componentRef.setInput('type', 'linear');
    fixture.componentRef.setInput('points', points);
    fixture.detectChanges();

    const pathData = fixture.componentInstance.pathData();
    expect(pathData).toContain('M');
    expect(pathData).toContain('L');
  });

  it('should produce an area path when baseLine is a number', () => {
    const fixture = TestBed.createComponent(CurveComponent);
    const points: CurvePoint[] = [{ x: 0, y: 0 }, { x: 50, y: 25 }, { x: 100, y: 50 }];
    fixture.componentRef.setInput('points', points);
    fixture.componentRef.setInput('baseLine', 200);
    fixture.detectChanges();

    const pathData = fixture.componentInstance.pathData();
    expect(pathData).toBeTruthy();
    // Area paths contain both M and L commands
    expect(pathData).toContain('M');
  });

  it('should produce an area path when baseLine is an array of points', () => {
    const fixture = TestBed.createComponent(CurveComponent);
    const points: CurvePoint[] = [{ x: 0, y: 0 }, { x: 50, y: 25 }, { x: 100, y: 50 }];
    const baseLine: CurvePoint[] = [{ x: 0, y: 200 }, { x: 50, y: 200 }, { x: 100, y: 200 }];
    fixture.componentRef.setInput('points', points);
    fixture.componentRef.setInput('baseLine', baseLine);
    fixture.detectChanges();

    const pathData = fixture.componentInstance.pathData();
    expect(pathData).toBeTruthy();
  });

  it('should handle vertical layout with numeric baseLine', () => {
    const fixture = TestBed.createComponent(CurveComponent);
    const points: CurvePoint[] = [{ x: 0, y: 0 }, { x: 50, y: 25 }];
    fixture.componentRef.setInput('points', points);
    fixture.componentRef.setInput('layout', 'vertical');
    fixture.componentRef.setInput('baseLine', 100);
    fixture.detectChanges();

    const pathData = fixture.componentInstance.pathData();
    expect(pathData).toBeTruthy();
  });

  it('should apply stroke and fill attributes', () => {
    const fixture = TestBed.createComponent(CurveComponent);
    fixture.componentRef.setInput('points', [{ x: 0, y: 0 }, { x: 100, y: 100 }]);
    fixture.componentRef.setInput('stroke', 'green');
    fixture.componentRef.setInput('fill', 'yellow');
    fixture.componentRef.setInput('strokeWidth', 3);
    fixture.detectChanges();

    const path = fixture.nativeElement.querySelector('path');
    expect(path.getAttribute('stroke')).toBe('green');
    expect(path.getAttribute('fill')).toBe('yellow');
    expect(path.getAttribute('stroke-width')).toBe('3');
  });

  it('should compute animationStyle when animation is active', () => {
    const fixture = TestBed.createComponent(CurveComponent);
    fixture.componentRef.setInput('isAnimationActive', true);
    fixture.componentRef.setInput('animationDuration', 400);
    fixture.componentRef.setInput('animationEasing', 'ease-in');
    fixture.componentRef.setInput('animationBegin', 50);
    fixture.detectChanges();

    const style = fixture.componentInstance.animationStyle();
    expect(style).toEqual({ transition: 'all 400ms ease-in 50ms' });
  });

  it('should return empty animationStyle when animation is inactive', () => {
    const fixture = TestBed.createComponent(CurveComponent);
    fixture.componentRef.setInput('isAnimationActive', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.animationStyle()).toEqual({});
  });

  it('should support all named curve types without throwing', () => {
    const curveTypes = [
      'basis', 'basisClosed', 'basisOpen', 'bumpX', 'bumpY', 'bundle',
      'cardinal', 'cardinalClosed', 'cardinalOpen', 'catmullRom',
      'catmullRomClosed', 'catmullRomOpen', 'linear', 'linearClosed',
      'monotoneX', 'monotoneY', 'natural', 'step', 'stepAfter', 'stepBefore',
    ] as const;

    const points: CurvePoint[] = [{ x: 0, y: 0 }, { x: 50, y: 50 }, { x: 100, y: 0 }];

    for (const type of curveTypes) {
      const fixture = TestBed.createComponent(CurveComponent);
      fixture.componentRef.setInput('type', type);
      fixture.componentRef.setInput('points', points);
      expect(() => fixture.detectChanges()).not.toThrow();
    }
  });
});
