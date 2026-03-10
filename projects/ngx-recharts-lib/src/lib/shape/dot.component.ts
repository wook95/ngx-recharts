import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'svg:g[ngx-dot]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shouldRender()) {
      <svg:circle
        [class]="className()"
        [attr.cx]="cx()"
        [attr.cy]="cy()"
        [attr.r]="r()"
        [attr.fill]="fill()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [style]="animationStyle()"
        (click)="dotClick.emit($event)"
        (mouseenter)="dotMouseEnter.emit($event)"
        (mouseleave)="dotMouseLeave.emit($event)" />
    }
  `,
})
export class DotComponent {
  cx = input<number>(0);
  cy = input<number>(0);
  r = input<number>(5);
  fill = input<string>('#ccc');
  stroke = input<string>('none');
  strokeWidth = input<number>(1);
  className = input<string>('');
  clipDot = input<boolean>(true);

  // Animation inputs
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(300);
  animationEasing = input<string>('ease');

  animationStyle = computed(() => {
    if (!this.isAnimationActive()) return {};
    const delay = `${this.animationBegin()}ms`;
    const duration = `${this.animationDuration()}ms`;
    const easing = this.animationEasing();
    return { transition: `all ${duration} ${easing} ${delay}` };
  });

  /**
   * Null guard: skip rendering when cx, cy, or r are not valid numbers.
   * Matches recharts Dot behaviour.
   */
  shouldRender = computed(() => {
    const cxVal = this.cx();
    const cyVal = this.cy();
    const rVal = this.r();
    return Number.isFinite(cxVal) && Number.isFinite(cyVal) && Number.isFinite(rVal) && rVal > 0;
  });

  dotClick = output<MouseEvent>();
  dotMouseEnter = output<MouseEvent>();
  dotMouseLeave = output<MouseEvent>();
}
