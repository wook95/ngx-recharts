import { TestBed } from '@angular/core/testing';
import { RectangleComponent } from './rectangle.component';

describe('RectangleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RectangleComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a rect element when no radius is set', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', 20);
    fixture.componentRef.setInput('width', 100);
    fixture.componentRef.setInput('height', 50);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.componentInstance.hasRadius()).toBeFalse();
    expect(fixture.nativeElement.querySelector('rect')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('should render a path element when radius > 0', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', 20);
    fixture.componentRef.setInput('width', 100);
    fixture.componentRef.setInput('height', 50);
    fixture.componentRef.setInput('radius', 8);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.componentInstance.hasRadius()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('rect')).toBeNull();
  });

  it('should render a path element when radius is an array with at least one positive value', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('x', 0);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('width', 80);
    fixture.componentRef.setInput('height', 40);
    fixture.componentRef.setInput('radius', [10, 0, 0, 0]);
    fixture.detectChanges();

    expect(fixture.componentInstance.hasRadius()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('should not render when x is NaN', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('x', NaN);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('width', 100);
    fixture.componentRef.setInput('height', 50);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('rect')).toBeNull();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('should not render when width is zero', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('x', 0);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('width', 0);
    fixture.componentRef.setInput('height', 50);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
  });

  it('should not render when height is zero', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('x', 0);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('width', 100);
    fixture.componentRef.setInput('height', 0);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
  });

  it('should generate valid pathData with uniform radius', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('x', 0);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('width', 100);
    fixture.componentRef.setInput('height', 50);
    fixture.componentRef.setInput('radius', 5);
    fixture.detectChanges();

    const pathData = fixture.componentInstance.pathData();
    expect(pathData).toContain('M');
    expect(pathData).toContain('Z');
    expect(pathData).toContain('A 5 5');
  });

  it('should compute animationStyle when animation is active', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('isAnimationActive', true);
    fixture.componentRef.setInput('animationDuration', 400);
    fixture.componentRef.setInput('animationEasing', 'ease-in');
    fixture.componentRef.setInput('animationBegin', 50);
    fixture.detectChanges();

    const style = fixture.componentInstance.animationStyle();
    expect(style).toEqual({ transition: 'all 400ms ease-in 50ms' });
  });

  it('should return empty animationStyle when animation is inactive', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('isAnimationActive', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.animationStyle()).toEqual({});
  });
});
