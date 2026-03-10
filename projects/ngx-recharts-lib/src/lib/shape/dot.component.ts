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
    @if (isRenderable()) {
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

  dotClick = output<MouseEvent>();
  dotMouseEnter = output<MouseEvent>();
  dotMouseLeave = output<MouseEvent>();

  isRenderable = computed(() => [this.cx(), this.cy(), this.r()].every(Number.isFinite) && this.r() > 0);
}

