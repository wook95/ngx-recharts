import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'svg:g[ngx-trapezoid]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isRenderable()) {
      <svg:path
        [attr.d]="pathData()"
        [attr.fill]="fill()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [class]="className()"
        [style]="animationStyle()"
        (click)="trapezoidClick.emit($event)"
        (mousedown)="trapezoidMouseDown.emit($event)"
        (mouseup)="trapezoidMouseUp.emit($event)"
        (mousemove)="trapezoidMouseMove.emit($event)"
        (mouseover)="trapezoidMouseOver.emit($event)"
        (mouseout)="trapezoidMouseOut.emit($event)"
        (mouseenter)="trapezoidMouseEnter.emit($event)"
        (mouseleave)="trapezoidMouseLeave.emit($event)" />
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

  trapezoidClick = output<MouseEvent>();
  trapezoidMouseDown = output<MouseEvent>();
  trapezoidMouseUp = output<MouseEvent>();
  trapezoidMouseMove = output<MouseEvent>();
  trapezoidMouseOver = output<MouseEvent>();
  trapezoidMouseOut = output<MouseEvent>();
  trapezoidMouseEnter = output<MouseEvent>();
  trapezoidMouseLeave = output<MouseEvent>();

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

  isRenderable = computed(() => {
    const x = this.x(), y = this.y();
    const uw = this.upperWidth(), lw = this.lowerWidth(), h = this.height();
    return Number.isFinite(x) && Number.isFinite(y)
      && Number.isFinite(uw) && Number.isFinite(lw) && Number.isFinite(h)
      && !(uw === 0 && lw === 0) && h !== 0;
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
