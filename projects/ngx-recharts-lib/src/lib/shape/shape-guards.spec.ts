import { TestBed } from '@angular/core/testing';
import { CrossComponent } from './cross.component';
import { DotComponent } from './dot.component';
import { RectangleComponent } from './rectangle.component';
import { SectorComponent } from './sector.component';
import { SymbolsComponent } from './symbols.component';
import { TrapezoidComponent } from './trapezoid.component';

describe('shape guard regressions', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossComponent, DotComponent, RectangleComponent, SectorComponent, SymbolsComponent, TrapezoidComponent],
    }).compileComponents();
  });

  // --- Cross ---

  it('Cross: renders with valid inputs', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', 10);
    fixture.componentRef.setInput('width', 20);
    fixture.componentRef.setInput('height', 20);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('Cross: hidden when x is NaN', () => {
    const fixture = TestBed.createComponent(CrossComponent);
    fixture.componentRef.setInput('x', NaN);
    fixture.componentRef.setInput('y', 10);
    fixture.componentRef.setInput('width', 20);
    fixture.componentRef.setInput('height', 20);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  // --- Rectangle ---

  it('Rectangle: renders with valid inputs', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('x', 0);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('width', 100);
    fixture.componentRef.setInput('height', 50);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('rect')).not.toBeNull();
  });

  it('Rectangle: hidden when x is NaN', () => {
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

  it('Rectangle: hidden when width is zero', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('width', 0);
    fixture.componentRef.setInput('height', 10);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('rect')).toBeNull();
  });

  it('Rectangle: hidden when height is zero', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('width', 10);
    fixture.componentRef.setInput('height', 0);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('rect')).toBeNull();
  });

  it('Rectangle: renders with negative width', () => {
    const fixture = TestBed.createComponent(RectangleComponent);
    fixture.componentRef.setInput('x', 100);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('width', -50);
    fixture.componentRef.setInput('height', 30);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
  });

  // --- Sector ---

  it('Sector: renders with valid inputs', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 80);
    fixture.componentRef.setInput('innerRadius', 0);
    fixture.componentRef.setInput('startAngle', 0);
    fixture.componentRef.setInput('endAngle', 90);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('Sector: hidden when outerRadius < innerRadius', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 4);
    fixture.componentRef.setInput('innerRadius', 6);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('Sector: hidden when startAngle === endAngle', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 80);
    fixture.componentRef.setInput('startAngle', 45);
    fixture.componentRef.setInput('endAngle', 45);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  // --- Trapezoid ---

  it('Trapezoid: renders with valid inputs', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('x', 0);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('upperWidth', 100);
    fixture.componentRef.setInput('lowerWidth', 50);
    fixture.componentRef.setInput('height', 30);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('Trapezoid: hidden when x is NaN', () => {
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

  it('Trapezoid: hidden when both widths are zero', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('upperWidth', 0);
    fixture.componentRef.setInput('lowerWidth', 0);
    fixture.componentRef.setInput('height', 30);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('Trapezoid: hidden when height is zero', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('upperWidth', 100);
    fixture.componentRef.setInput('lowerWidth', 50);
    fixture.componentRef.setInput('height', 0);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('Trapezoid: renders when only upperWidth is zero (lowerWidth > 0)', () => {
    const fixture = TestBed.createComponent(TrapezoidComponent);
    fixture.componentRef.setInput('upperWidth', 0);
    fixture.componentRef.setInput('lowerWidth', 50);
    fixture.componentRef.setInput('height', 30);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  // --- Dot ---

  it('Dot: renders with valid inputs', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('cx', 50);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('r', 5);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('circle')).not.toBeNull();
  });

  it('Dot: hidden when cx is NaN', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('cx', NaN);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('r', 5);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('circle')).toBeNull();
  });

  // --- Symbols ---

  it('Symbols: renders with valid inputs', () => {
    const fixture = TestBed.createComponent(SymbolsComponent);
    fixture.componentRef.setInput('cx', 50);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('size', 64);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('Symbols: hidden when cx is NaN', () => {
    const fixture = TestBed.createComponent(SymbolsComponent);
    fixture.componentRef.setInput('cx', NaN);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('size', 64);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });
});
