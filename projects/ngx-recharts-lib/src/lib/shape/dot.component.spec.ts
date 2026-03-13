import { TestBed } from '@angular/core/testing';
import { DotComponent } from './dot.component';

describe('DotComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DotComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a circle with valid inputs', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('cx', 50);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('r', 5);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeTrue();
    expect(fixture.nativeElement.querySelector('circle')).not.toBeNull();
  });

  it('should not render when cx is NaN', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('cx', NaN);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('r', 5);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('circle')).toBeNull();
  });

  it('should not render when cy is NaN', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('cx', 50);
    fixture.componentRef.setInput('cy', NaN);
    fixture.componentRef.setInput('r', 5);
    fixture.detectChanges();

    expect(fixture.componentInstance.isRenderable()).toBeFalse();
    expect(fixture.nativeElement.querySelector('circle')).toBeNull();
  });

  it('should apply cx, cy, r attributes to circle element', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('cx', 30);
    fixture.componentRef.setInput('cy', 40);
    fixture.componentRef.setInput('r', 8);
    fixture.detectChanges();

    const circle = fixture.nativeElement.querySelector('circle');
    expect(circle.getAttribute('cx')).toBe('30');
    expect(circle.getAttribute('cy')).toBe('40');
    expect(circle.getAttribute('r')).toBe('8');
  });

  it('should apply fill and stroke attributes to circle element', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('cx', 10);
    fixture.componentRef.setInput('cy', 10);
    fixture.componentRef.setInput('r', 5);
    fixture.componentRef.setInput('fill', 'red');
    fixture.componentRef.setInput('stroke', 'blue');
    fixture.componentRef.setInput('strokeWidth', 2);
    fixture.detectChanges();

    const circle = fixture.nativeElement.querySelector('circle');
    expect(circle.getAttribute('fill')).toBe('red');
    expect(circle.getAttribute('stroke')).toBe('blue');
    expect(circle.getAttribute('stroke-width')).toBe('2');
  });

  it('should emit dotClick event on click', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('cx', 50);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('r', 5);
    fixture.detectChanges();

    const emitted: MouseEvent[] = [];
    fixture.componentInstance.dotClick.subscribe((e: MouseEvent) => emitted.push(e));

    const circle = fixture.nativeElement.querySelector('circle');
    const mouseEvent = new MouseEvent('click');
    circle.dispatchEvent(mouseEvent);

    expect(emitted.length).toBe(1);
  });

  it('should emit dotMouseEnter and dotMouseLeave events', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('cx', 50);
    fixture.componentRef.setInput('cy', 50);
    fixture.componentRef.setInput('r', 5);
    fixture.detectChanges();

    const entered: MouseEvent[] = [];
    const left: MouseEvent[] = [];
    fixture.componentInstance.dotMouseEnter.subscribe((e: MouseEvent) => entered.push(e));
    fixture.componentInstance.dotMouseLeave.subscribe((e: MouseEvent) => left.push(e));

    const circle = fixture.nativeElement.querySelector('circle');
    circle.dispatchEvent(new MouseEvent('mouseenter'));
    circle.dispatchEvent(new MouseEvent('mouseleave'));

    expect(entered.length).toBe(1);
    expect(left.length).toBe(1);
  });

  it('should compute animationStyle when animation is active', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('isAnimationActive', true);
    fixture.componentRef.setInput('animationDuration', 600);
    fixture.componentRef.setInput('animationEasing', 'ease-out');
    fixture.componentRef.setInput('animationBegin', 200);
    fixture.detectChanges();

    const style = fixture.componentInstance.animationStyle();
    expect(style).toEqual({ transition: 'all 600ms ease-out 200ms' });
  });

  it('should return empty animationStyle when animation is inactive', () => {
    const fixture = TestBed.createComponent(DotComponent);
    fixture.componentRef.setInput('isAnimationActive', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.animationStyle()).toEqual({});
  });
});
