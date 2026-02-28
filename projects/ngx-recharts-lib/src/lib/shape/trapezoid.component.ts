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
    <svg:path
      [attr.d]="pathData()"
      [attr.fill]="fill()"
      [attr.stroke]="stroke()"
      [attr.stroke-width]="strokeWidth()"
      [class]="className()"
      [style]="animationStyle()" />
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

    // Calculate vertices for a center-aligned trapezoid
    // Top edge at y, bottom edge at y + height
    // Trapezoid is centered horizontally based on lowerWidth
    const topLeftX = x + (lowerWidth - upperWidth) / 2;
    const topLeftY = y;

    const topRightX = x + (lowerWidth + upperWidth) / 2;
    const topRightY = y;

    const bottomRightX = x + lowerWidth;
    const bottomRightY = y + height;

    const bottomLeftX = x;
    const bottomLeftY = y + height;

    // Path: M topLeft L topRight L bottomRight L bottomLeft Z
    return [
      `M ${topLeftX} ${topLeftY}`,
      `L ${topRightX} ${topRightY}`,
      `L ${bottomRightX} ${bottomRightY}`,
      `L ${bottomLeftX} ${bottomLeftY}`,
      'Z',
    ].join(' ');
  });
}
