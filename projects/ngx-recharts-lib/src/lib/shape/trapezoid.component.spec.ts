import { TestBed } from '@angular/core/testing';
import { TrapezoidComponent } from './trapezoid.component';

describe('TrapezoidComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrapezoidComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a path with valid symmetric inputs', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('x', 0);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('upperWidth', 100);
    fixture.componentRef.setInput('lowerWidth', 80);
    fixture.componentRef.setInput('height', 40);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('should not render when x is NaN', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('x', NaN);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('upperWidth', 100);
    fixture.componentRef.setInput('lowerWidth', 50);
    fixture.componentRef.setInput('height', 30);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('should not render when both widths are zero', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('upperWidth', 0);
    fixture.componentRef.setInput('lowerWidth', 0);
    fixture.componentRef.setInput('height', 30);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
  });

  it('should not render when height is zero', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('upperWidth', 100);
    fixture.componentRef.setInput('lowerWidth', 50);
    fixture.componentRef.setInput('height', 0);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
  });

  it('should render when only lowerWidth is non-zero (triangle shape)', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('x', 0);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('upperWidth', 0);
    fixture.componentRef.setInput('lowerWidth', 60);
    fixture.componentRef.setInput('height', 40);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('should generate correct pathData for asymmetric widths', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', 5);
    fixture.componentRef.setInput('upperWidth', 80);
    fixture.componentRef.setInput('lowerWidth', 100);
    fixture.componentRef.setInput('height', 30);
    fixture.detectChanges();

    const pathData = fixture.componentInstance.pathData();
    expect(pathData).toContain('M 10 5');
    expect(pathData).toContain('Z');
  });

  it('should compute animationStyle when animation is active', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('isAnimationActive', true);
    fixture.componentRef.setInput('animationDuration', 250);
    fixture.componentRef.setInput('animationEasing', 'ease-in-out');
    fixture.componentRef.setInput('animationBegin', 0);
    fixture.detectChanges();

    const style = fixture.componentInstance.animationStyle();
    expect(style).toEqual({ transition: 'all 250ms ease-in-out 0ms' });
  });

  it('should return empty animationStyle when animation is inactive', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('isAnimationActive', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.animationStyle()).toEqual({});
  });
});
