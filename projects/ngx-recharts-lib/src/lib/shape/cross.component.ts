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
    <svg:path
      [attr.d]="pathData()"
      [attr.fill]="fill()"
      [attr.stroke]="stroke()"
      [attr.stroke-width]="strokeWidth()"
      [class]="className()"
      [style]="animationStyle()" />
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
    const cx = this.x();
    const cy = this.y();
    const w = this.width();
    const h = this.height();

    const halfW = w / 2;
    const halfH = h / 2;
    const armW = w / 6;
    const armH = h / 6;

    return [
      `M ${cx - armW} ${cy - halfH}`,
      `L ${cx + armW} ${cy - halfH}`,
      `L ${cx + armW} ${cy - armH}`,
      `L ${cx + halfW} ${cy - armH}`,
      `L ${cx + halfW} ${cy + armH}`,
      `L ${cx + armW} ${cy + armH}`,
      `L ${cx + armW} ${cy + halfH}`,
      `L ${cx - armW} ${cy + halfH}`,
      `L ${cx - armW} ${cy + armH}`,
      `L ${cx - halfW} ${cy + armH}`,
      `L ${cx - halfW} ${cy - armH}`,
      `L ${cx - armW} ${cy - armH}`,
      'Z',
    ].join(' ');
  });
}
