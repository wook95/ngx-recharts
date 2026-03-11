import { TestBed } from '@angular/core/testing';
import { SurfaceComponent } from './surface.component';
import { ChartLayoutService } from '../services/chart-layout.service';
import { ClipPathService } from '../services/clip-path.service';
import { AxisRegistryService } from '../services/axis-registry.service';

describe('SurfaceComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurfaceComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(SurfaceComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render an SVG element', () => {
    const fixture = TestBed.createComponent(SurfaceComponent);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('should set width and height attributes on the SVG', () => {
    const fixture = TestBed.createComponent(SurfaceComponent);
    fixture.componentRef.setInput('width', 800);
    fixture.componentRef.setInput('height', 600);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('800');
    expect(svg.getAttribute('height')).toBe('600');
  });

  it('should compute resolvedViewBox from width and height when viewBox not provided', () => {
    const fixture = TestBed.createComponent(SurfaceComponent);
    fixture.componentRef.setInput('width', 400);
    fixture.componentRef.setInput('height', 300);
    fixture.detectChanges();
    expect(fixture.componentInstance.resolvedViewBox()).toBe('0 0 400 300');
  });

  it('should use provided viewBox input over computed value', () => {
    const fixture = TestBed.createComponent(SurfaceComponent);
    fixture.componentRef.setInput('width', 400);
    fixture.componentRef.setInput('height', 300);
    fixture.componentRef.setInput('viewBox', '0 0 800 600');
    fixture.detectChanges();
    expect(fixture.componentInstance.resolvedViewBox()).toBe('0 0 800 600');
  });

  it('should render title element when title input is provided', () => {
    const fixture = TestBed.createComponent(SurfaceComponent);
    fixture.componentRef.setInput('title', 'My Chart');
    fixture.detectChanges();
    const titleEl = fixture.nativeElement.querySelector('title');
    expect(titleEl).not.toBeNull();
    expect(titleEl.textContent).toBe('My Chart');
  });

  it('should render desc element when desc input is provided', () => {
    const fixture = TestBed.createComponent(SurfaceComponent);
    fixture.componentRef.setInput('desc', 'Chart description');
    fixture.detectChanges();
    const descEl = fixture.nativeElement.querySelector('desc');
    expect(descEl).not.toBeNull();
    expect(descEl.textContent).toBe('Chart description');
  });

  it('should apply recharts-surface class on SVG', () => {
    const fixture = TestBed.createComponent(SurfaceComponent);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.classList.contains('recharts-surface')).toBe(true);
  });

  it('should append className to the SVG class attribute', () => {
    const fixture = TestBed.createComponent(SurfaceComponent);
    fixture.componentRef.setInput('className', 'custom-class');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.classList.contains('recharts-surface')).toBe(true);
    expect(svg.classList.contains('custom-class')).toBe(true);
  });

  describe('with ClipPathService provided', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SurfaceComponent],
        providers: [AxisRegistryService, ClipPathService],
      }).compileComponents();
    });

    it('should not render defs when shouldClip is false', () => {
      const fixture = TestBed.createComponent(SurfaceComponent);
      fixture.componentRef.setInput('width', 400);
      fixture.componentRef.setInput('height', 300);
      fixture.detectChanges();
      // shouldClip is false by default (no axes with allowDataOverflow)
      const defs = fixture.nativeElement.querySelector('defs');
      expect(defs).toBeNull();
    });
  });
});
