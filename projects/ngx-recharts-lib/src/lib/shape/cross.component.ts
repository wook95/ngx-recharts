import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'svg:g[ngx-cross]',
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
export class CrossComponent {
  x = input<number>(0);
  y = input<number>(0);
  width = input<number>(10);
  height = input<number>(10);
  top = input<number | undefined>(undefined);
  left = input<number | undefined>(undefined);
  stroke = input<string>('#333');
  fill = input<string>('none');
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
    const w = this.width();
    const h = this.height();
    return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;
  });

  /**
   * Recharts Cross is a thin crosshair: two perpendicular lines
   * centered at (x, y). The vertical line spans from top to top+height,
   * the horizontal line spans from left to left+width.
   *
   * Path: M{x},{top}v{height}M{left},{y}h{width}
   */
  pathData = computed(() => {
    if (!this.shouldRender()) return '';

    const cx = this.x();
    const cy = this.y();
    const w = this.width();
    const h = this.height();

    const topVal = this.top() ?? (cy - h / 2);
    const leftVal = this.left() ?? (cx - w / 2);

    return `M${cx},${topVal}v${h}M${leftVal},${cy}h${w}`;
  });
}
