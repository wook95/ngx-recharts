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
    @if (pathData(); as path) {
      <svg:path
        [attr.d]="path"
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

  pathData = computed(() => {
    const x = this.x();
    const y = this.y();
    const upperWidth = this.upperWidth();
    const lowerWidth = this.lowerWidth();
    const height = this.height();

    if (![x, y, upperWidth, lowerWidth, height].every(Number.isFinite)
      || upperWidth < 0
      || lowerWidth < 0
      || height <= 0) {
      return null;
    }

    const offset = (lowerWidth - upperWidth) / 2;

    return [
      `M ${x} ${y}`,
      `L ${x + upperWidth} ${y}`,
      `L ${x + lowerWidth - offset} ${y + height}`,
      `L ${x - offset} ${y + height}`,
      'Z',
    ].join(' ');
  });
}
