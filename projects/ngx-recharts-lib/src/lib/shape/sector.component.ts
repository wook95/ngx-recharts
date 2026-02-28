import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { arc } from 'd3-shape';

@Component({
  selector: 'svg:g[ngx-sector]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pathData()) {
      <svg:path
        [attr.d]="pathData()"
        [attr.transform]="transform()"
        [attr.fill]="fill()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [class]="className()"
        [style]="animationStyle()" />
    }
  `,
})
export class SectorComponent {
  cx = input<number>(0);
  cy = input<number>(0);
  innerRadius = input<number>(0);
  outerRadius = input.required<number>();
  startAngle = input<number>(0);
  endAngle = input<number>(0);
  cornerRadius = input<number>(0);
  forceCornerRadius = input<boolean>(false);
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

  transform = computed(() => `translate(${this.cx()}, ${this.cy()})`);

  pathData = computed(() => {
    const outerRadius = this.outerRadius();
    const innerRadius = this.innerRadius();
    const startAngle = this.startAngle();
    const endAngle = this.endAngle();
    const cornerRadius = this.cornerRadius();

    const arcGenerator = arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(cornerRadius)
      .startAngle(startAngle * Math.PI / 180)
      .endAngle(endAngle * Math.PI / 180);

    return arcGenerator({} as any) ?? '';
  });
}
