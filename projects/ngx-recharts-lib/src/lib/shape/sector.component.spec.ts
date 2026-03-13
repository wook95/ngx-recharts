import { TestBed } from '@angular/core/testing';
import { SectorComponent } from './sector.component';

describe('SectorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 80);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a path with valid inputs', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 80);
    fixture.componentRef.setInput('innerRadius', 0);
    fixture.componentRef.setInput('startAngle', 0);
    fixture.componentRef.setInput('endAngle', 90);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('path')).not.toBeNull();
  });

  it('should not render when outerRadius < innerRadius', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 10);
    fixture.componentRef.setInput('innerRadius', 20);
    fixture.componentRef.setInput('startAngle', 0);
    fixture.componentRef.setInput('endAngle', 90);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('should not render when startAngle equals endAngle', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 80);
    fixture.componentRef.setInput('startAngle', 45);
    fixture.componentRef.setInput('endAngle', 45);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('path')).toBeNull();
  });

  it('should render a donut sector with innerRadius > 0', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 100);
    fixture.componentRef.setInput('innerRadius', 50);
    fixture.componentRef.setInput('startAngle', 0);
    fixture.componentRef.setInput('endAngle', 180);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    const pathData = fixture.componentInstance.pathData();
    expect(pathData).not.toBe('');
    expect(pathData).toContain('A');
  });

  it('should render a full circle sector (0 to 360)', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 80);
    fixture.componentRef.setInput('innerRadius', 0);
    fixture.componentRef.setInput('startAngle', 0);
    fixture.componentRef.setInput('endAngle', 360);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    const pathData = fixture.componentInstance.pathData();
    expect(pathData).not.toBe('');
  });

  it('should compute transform from cx/cy', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 80);
    fixture.componentRef.setInput('cx', 200);
    fixture.componentRef.setInput('cy', 150);
    fixture.detectChanges();

    expect(fixture.componentInstance.transform()).toBe('translate(200, 150)');
  });

  it('should return empty pathData when outerRadius is invalid', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 0);
    fixture.componentRef.setInput('innerRadius', 0);
    fixture.componentRef.setInput('startAngle', 0);
    fixture.componentRef.setInput('endAngle', 90);
    fixture.detectChanges();

    expect(fixture.componentInstance.pathData()).toBe('');
  });

  it('should compute animationStyle when animation is active', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 80);
    fixture.componentRef.setInput('isAnimationActive', true);
    fixture.componentRef.setInput('animationDuration', 600);
    fixture.componentRef.setInput('animationEasing', 'ease-out');
    fixture.componentRef.setInput('animationBegin', 200);
    fixture.detectChanges();

    const style = fixture.componentInstance.animationStyle();
    expect(style).toEqual({ transition: 'all 600ms ease-out 200ms' });
  });

  it('should return empty animationStyle when animation is inactive', () => {
    const fixture = TestBed.createComponent(SectorComponent);
    fixture.componentRef.setInput('outerRadius', 80);
    fixture.componentRef.setInput('isAnimationActive', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.animationStyle()).toEqual({});
  });
});
