import { TestBed } from '@angular/core/testing';
import { CrossComponent } from './cross.component';
import { DotComponent } from './dot.component';
import { RectangleComponent } from './rectangle.component';
import { SectorComponent } from './sector.component';
import { TrapezoidComponent } from './trapezoid.component';

describe('shape guard regressions', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossComponent, DotComponent, RectangleComponent, SectorComponent, TrapezoidComponent],
    }).compileComponents();
  });

  it('renders Cross as two thin lines using x/y as the center', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('x', 15);
    fixture.componentRef.setInput('y', 20);
    fixture.componentRef.setInput('width', 8);
    fixture.componentRef.setInput('height', 10);
    fixture.detectChanges();

    expect(fixture.componentInstance.pathData()).toBe('M 15 15 V 25 M 11 20 H 19');
  });

  it('renders Trapezoid as a top-aligned shape rooted at x/y', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', 5);
    fixture.componentRef.setInput('upperWidth', 20);
    fixture.componentRef.setInput('lowerWidth', 30);
    fixture.componentRef.setInput('height', 40);
    fixture.detectChanges();

    expect(fixture.componentInstance.pathData()).toBe('M 10 5 L 30 5 L 35 45 L 5 45 Z');
  });

  it('does not render Dot when coordinates are invalid', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('cx', Number.NaN);
    fixture.componentRef.setInput('cy', 10);
    fixture.componentRef.setInput('r', 4);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('circle')).toBeNull();
  });

  it('does not render Rectangle when width is zero', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('width', 0);
    fixture.componentRef.setInput('height', 10);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('rect')).toBeNull();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('returns empty Sector path when outer radius is smaller than inner radius', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 4);
    fixture.componentRef.setInput('innerRadius', 6);
    fixture.detectChanges();

    expect(fixture.componentInstance.pathData()).toBe('');
  });
});
