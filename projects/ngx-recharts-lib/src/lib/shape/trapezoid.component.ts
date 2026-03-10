import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'svg:g[ngx-trapezoid]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shouldRender()) {
      <svg:path
        [attr.d]="pathData()"
        [attr.fill]="fill()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [class]="className()"
        [style]="animationStyle()" />
    }
  `,
})
export class TrapezoidComponent {
  x = input<number>(0);
  y = input<number>(0);
  upperWidth = input<number>(0);
  lowerWidth = input<number>(0);
  height = input<number>(0);
  fill = input<string>('#ccc');
  stroke = input<string>('none');
  strokeWidth = input<number>(1);
  className = input<string>('');

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
   * Whether the component should render. Returns false for invalid inputs.
   */
  shouldRender = computed(() => {
    const h = this.height();
    return Number.isFinite(h) && h > 0;
  });

  /**
   * Recharts Trapezoid: top-aligned, starting at (x, y).
   *
   * The upper edge spans from (x, y) to (x + upperWidth, y).
   * The lower edge is centered beneath the upper edge:
   *   from (x + (upperWidth - lowerWidth) / 2, y + height)
   *   to   (x + (upperWidth + lowerWidth) / 2, y + height)
   *
   * This matches how recharts draws trapezoids in FunnelChart.
   */
  pathData = computed(() => {
    if (!this.shouldRender()) return '';

    const x = this.x();
    const y = this.y();
    const upperWidth = this.upperWidth();
    const lowerWidth = this.lowerWidth();
    const height = this.height();

    // Top edge: starts at (x, y), width = upperWidth
    const topLeftX = x;
    const topLeftY = y;
    const topRightX = x + upperWidth;
    const topRightY = y;

    // Bottom edge: centered under the upper edge
    const bottomRightX = x + (upperWidth + lowerWidth) / 2;
    const bottomRightY = y + height;
    const bottomLeftX = x + (upperWidth - lowerWidth) / 2;
    const bottomLeftY = y + height;

    return [
      `M ${topLeftX} ${topLeftY}`,
      `L ${topRightX} ${topRightY}`,
      `L ${bottomRightX} ${bottomRightY}`,
      `L ${bottomLeftX} ${bottomLeftY}`,
      'Z',
    ].join(' ');
  });
}
