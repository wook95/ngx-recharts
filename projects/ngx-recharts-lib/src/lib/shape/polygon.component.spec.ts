import { TestBed } from '@angular/core/testing';
import { PolygonComponent } from './polygon.component';

describe('PolygonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolygonComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(PolygonComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a path element always (even with empty points)', () => {
    const fixture = TestBed.createComponent(PolygonComponent);
    fixture.componentRef.setInput('points', []);
    fixture.detectChanges();

    // Template always renders path (no isRenderable guard on polygon)
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('should produce an empty pathData string when points is empty', () => {
    const fixture = TestBed.createComponent(PolygonComponent);
    fixture.componentRef.setInput('points', []);
    fixture.detectChanges();

    expect(fixture.componentInstance.pathData()).toBe('');
  });

  it('should compute pathData for a triangle', () => {
    const fixture = TestBed.createComponent(PolygonComponent);
    const points = [{ x: 0, y: 0 }, { x: 50, y: 100 }, { x: 100, y: 0 }];
    fixture.componentRef.setInput('points', points);
    fixture.detectChanges();

    const pathData = fixture.componentInstance.pathData();
    expect(pathData).toContain('M 0 0');
    expect(pathData).toContain('L 50 100');
    expect(pathData).toContain('L 100 0');
    expect(pathData).toContain('Z');
  });

  it('should use areaPathData when baseLinePoints are provided', () => {
    const fixture = TestBed.createComponent(PolygonComponent);
    const points = [{ x: 0, y: 0 }, { x: 50, y: 25 }, { x: 100, y: 0 }];
    const baseLinePoints = [{ x: 0, y: 100 }, { x: 50, y: 100 }, { x: 100, y: 100 }];
    fixture.componentRef.setInput('points', points);
    fixture.componentRef.setInput('baseLinePoints', baseLinePoints);
    fixture.detectChanges();

    expect(fixture.componentInstance.hasBaseLinePoints()).toBeTrue();
    const areaPath = fixture.componentInstance.areaPathData();
    expect(areaPath).toContain('M 0 0');
    expect(areaPath).toContain('Z');
  });

  it('should return empty areaPathData when baseLinePoints is empty', () => {
    const fixture = TestBed.createComponent(PolygonComponent);
    fixture.componentRef.setInput('points', [{ x: 0, y: 0 }, { x: 50, y: 50 }]);
    fixture.componentRef.setInput('baseLinePoints', []);
    fixture.detectChanges();

    expect(fixture.componentInstance.hasBaseLinePoints()).toBeFalse();
    expect(fixture.componentInstance.areaPathData()).toBe('');
  });

  it('should apply fill, stroke, and fillOpacity attributes', () => {
    const fixture = TestBed.createComponent(PolygonComponent);
    fixture.componentRef.setInput('points', [{ x: 0, y: 0 }, { x: 50, y: 50 }, { x: 100, y: 0 }]);
    fixture.componentRef.setInput('fill', 'red');
    fixture.componentRef.setInput('stroke', 'blue');
    fixture.componentRef.setInput('strokeWidth', 2);
    fixture.componentRef.setInput('fillOpacity', 0.5);
    fixture.detectChanges();

    const path = fixture.nativeElement.querySelector('path');
    expect(path.getAttribute('fill')).toBe('red');
    expect(path.getAttribute('stroke')).toBe('blue');
    expect(path.getAttribute('stroke-width')).toBe('2');
    expect(path.getAttribute('fill-opacity')).toBe('0.5');
  });

  it('should compute animationStyle when animation is active', () => {
    const fixture = TestBed.createComponent(PolygonComponent);
    fixture.componentRef.setInput('isAnimationActive', true);
    fixture.componentRef.setInput('animationDuration', 300);
    fixture.componentRef.setInput('animationEasing', 'ease');
    fixture.componentRef.setInput('animationBegin', 0);
    fixture.detectChanges();

    const style = fixture.componentInstance.animationStyle();
    expect(style).toEqual({ transition: 'all 300ms ease 0ms' });
  });

  it('should return empty animationStyle when animation is inactive', () => {
    const fixture = TestBed.createComponent(PolygonComponent);
    fixture.componentRef.setInput('isAnimationActive', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.animationStyle()).toEqual({});
  });
});
