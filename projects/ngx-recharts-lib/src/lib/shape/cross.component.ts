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

  pathData = computed(() => {
    const x = this.x();
    const y = this.y();
    const width = this.width();
    const height = this.height();
    const top = this.top() ?? (y - height / 2);
    const left = this.left() ?? (x - width / 2);

    if (![x, y, width, height, top, left].every(Number.isFinite) || width <= 0 || height <= 0) {
      return null;
    }

    return [
      `M ${x} ${top}`,
      `V ${top + height}`,
      `M ${left} ${y}`,
      `H ${left + width}`,
    ].join(' ');
  });
}
