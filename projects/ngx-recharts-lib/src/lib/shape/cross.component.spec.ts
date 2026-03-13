import { TestBed } from '@angular/core/testing';
import { CrossComponent } from './cross.component';

describe('CrossComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a path with valid inputs', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', 10);
    fixture.componentRef.setInput('width', 20);
    fixture.componentRef.setInput('height', 20);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('should not render when x is NaN', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('x', NaN);
    fixture.componentRef.setInput('y', 10);
    fixture.componentRef.setInput('width', 20);
    fixture.componentRef.setInput('height', 20);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('should not render when y is NaN', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', NaN);
    fixture.componentRef.setInput('width', 20);
    fixture.componentRef.setInput('height', 20);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('should compute pathData with default top/left derived from x/y', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', 10);
    fixture.componentRef.setInput('width', 20);
    fixture.componentRef.setInput('height', 20);
    fixture.detectChanges();

    const pathData = fixture.componentInstance.pathData();
    expect(pathData).not.toBeNull();
    // Vertical line: M x top V top+height  => M 10 0 V 20
    expect(pathData).toContain('M 10 0');
    expect(pathData).toContain('V 20');
    // Horizontal line: M left y H left+width => M 0 10 H 20
    expect(pathData).toContain('M 0 10');
    expect(pathData).toContain('H 20');
  });

  it('should use explicit top and left when provided', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('x', 50);
    fixture.componentRef.setInput('y', 50);
    fixture.componentRef.setInput('width', 10);
    fixture.componentRef.setInput('height', 10);
    fixture.componentRef.setInput('top', 5);
    fixture.componentRef.setInput('left', 5);
    fixture.detectChanges();

    const pathData = fixture.componentInstance.pathData();
    expect(pathData).toContain('M 50 5');
    expect(pathData).toContain('M 5 50');
  });

  it('should apply stroke and fill attributes to path', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', 10);
    fixture.componentRef.setInput('width', 20);
    fixture.componentRef.setInput('height', 20);
    fixture.componentRef.setInput('stroke', 'red');
    fixture.componentRef.setInput('fill', 'blue');
    fixture.detectChanges();

    const path = fixture.nativeElement.querySelector('path');
    expect(path.getAttribute('stroke')).toBe('red');
    expect(path.getAttribute('fill')).toBe('blue');
  });

  it('should return null pathData when width is zero', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', 10);
    fixture.componentRef.setInput('width', 0);
    fixture.componentRef.setInput('height', 20);
    fixture.detectChanges();

    // isRenderable checks isFinite only, but pathData returns null for width<=0
    expect(fixture.componentInstance.pathData()).toBeNull();
  });

  it('should compute animationStyle when animation is active', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('isAnimationActive', true);
    fixture.componentRef.setInput('animationDuration', 500);
    fixture.componentRef.setInput('animationEasing', 'linear');
    fixture.componentRef.setInput('animationBegin', 100);
    fixture.detectChanges();

    const style = fixture.componentInstance.animationStyle();
    expect(style).toEqual({ transition: 'all 500ms linear 100ms' });
  });

  it('should return empty animationStyle when animation is inactive', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('isAnimationActive', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.animationStyle()).toEqual({});
  });
});
