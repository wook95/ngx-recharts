import { TestBed } from '@angular/core/testing';
import { SymbolsComponent, SymbolType } from './symbols.component';

describe('SymbolsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymbolsComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(SymbolsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a path with valid inputs (default circle)', () => {
    const fixture = TestBed.createComponent(SymbolsComponent);
    fixture.componentRef.setInput('cx', 50);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('size', 64);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('should not render when cx is NaN', () => {
    const fixture = TestBed.createComponent(SymbolsComponent);
    fixture.componentRef.setInput('cx', NaN);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('size', 64);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('should not render when cy is NaN', () => {
    const fixture = TestBed.createComponent(SymbolsComponent);
    fixture.componentRef.setInput('cx', 50);
    fixture.componentRef.setInput('cy', NaN);
    fixture.componentRef.setInput('size', 64);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  const symbolTypes: SymbolType[] = ['circle', 'cross', 'diamond', 'square', 'star', 'triangle', 'wye'];

  symbolTypes.forEach(type => {
    it(`should render symbolPath for type "${type}"`, () => {
      const fixture = TestBed.createComponent(SymbolsComponent);
      fixture.componentRef.setInput('cx', 0);
      fixture.componentRef.setInput('cy', 0);
      fixture.componentRef.setInput('size', 64);
      fixture.componentRef.setInput('type', type);
      fixture.detectChanges();

      const path = fixture.componentInstance.symbolPath();
      expect(path).not.toBe('');
      expect(path).toContain('M');
    });
  });

  it('should compute transform from cx/cy', () => {
    const fixture = TestBed.createComponent(SymbolsComponent);
    fixture.componentRef.setInput('cx', 100);
    fixture.componentRef.setInput('cy', 200);
    fixture.detectChanges();

    expect(fixture.componentInstance.transform()).toBe('translate(100, 200)');
  });

  it('should apply fill and stroke attributes to path', () => {
    const fixture = TestBed.createComponent(SymbolsComponent);
    fixture.componentRef.setInput('cx', 50);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('size', 64);
    fixture.componentRef.setInput('fill', 'green');
    fixture.componentRef.setInput('stroke', 'black');
    fixture.detectChanges();

    const path = fixture.nativeElement.querySelector('path');
    expect(path.getAttribute('fill')).toBe('green');
    expect(path.getAttribute('stroke')).toBe('black');
  });

  it('should compute animationStyle when animation is active', () => {
    const fixture = TestBed.createComponent(SymbolsComponent);
    fixture.componentRef.setInput('isAnimationActive', true);
    fixture.componentRef.setInput('animationDuration', 350);
    fixture.componentRef.setInput('animationEasing', 'linear');
    fixture.componentRef.setInput('animationBegin', 75);
    fixture.detectChanges();

    const style = fixture.componentInstance.animationStyle();
    expect(style).toEqual({ transition: 'all 350ms linear 75ms' });
  });

  it('should return empty animationStyle when animation is inactive', () => {
    const fixture = TestBed.createComponent(SymbolsComponent);
    fixture.componentRef.setInput('isAnimationActive', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.animationStyle()).toEqual({});
  });
});
