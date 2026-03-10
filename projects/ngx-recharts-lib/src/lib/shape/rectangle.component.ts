import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'svg:g[ngx-rectangle]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isRenderable() && hasRadius()) {
      <svg:path
        [attr.d]="pathData()"
        [attr.fill]="fill()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [class]="className()"
        [style]="animationStyle()"
        (click)="rectClick.emit($event)"
        (mouseenter)="rectMouseEnter.emit($event)"
        (mouseleave)="rectMouseLeave.emit($event)" />
    } @else if (isRenderable()) {
      <svg:rect
        [attr.x]="x()"
        [attr.y]="y()"
        [attr.width]="width()"
        [attr.height]="height()"
        [attr.fill]="fill()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [class]="className()"
        [style]="animationStyle()"
        (click)="rectClick.emit($event)"
        (mouseenter)="rectMouseEnter.emit($event)"
        (mouseleave)="rectMouseLeave.emit($event)" />
    }
  `,
})
export class RectangleComponent {
  x = input<number>(0);
  y = input<number>(0);
  width = input<number>(0);
  height = input<number>(0);
  radius = input<number | [number, number, number, number]>(0);
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

  rectClick = output<MouseEvent>();
  rectMouseEnter = output<MouseEvent>();
  rectMouseLeave = output<MouseEvent>();

  isRenderable = computed(() => {
    const x = this.x(), y = this.y(), w = this.width(), h = this.height();
    return Number.isFinite(x) && Number.isFinite(y)
      && Number.isFinite(w) && Number.isFinite(h)
      && w !== 0 && h !== 0;
  });

  hasRadius = computed(() => {
    const r = this.radius();
    if (typeof r === 'number') return r > 0;
    return r.some(v => v > 0);
  });

  pathData = computed(() => {
    const x = this.x();
    const y = this.y();
    const w = this.width();
    const h = this.height();
    const r = this.radius();

    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
      return '';
    }

    const maxR = Math.min(w / 2, h / 2);

    let tl: number, tr: number, br: number, bl: number;
    if (typeof r === 'number') {
      tl = tr = br = bl = Math.min(r, maxR);
    } else {
      tl = Math.min(r[0], maxR);
      tr = Math.min(r[1], maxR);
      br = Math.min(r[2], maxR);
      bl = Math.min(r[3], maxR);
    }

    // Build path: start at top-left after top-left corner arc
    // Move clockwise: top edge → top-right → right edge → bottom-right → bottom edge → bottom-left → left edge → top-left
    return [
      `M ${x + tl} ${y}`,
      `L ${x + w - tr} ${y}`,
      tr > 0 ? `A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr}` : `L ${x + w} ${y}`,
      `L ${x + w} ${y + h - br}`,
      br > 0 ? `A ${br} ${br} 0 0 1 ${x + w - br} ${y + h}` : `L ${x + w} ${y + h}`,
      `L ${x + bl} ${y + h}`,
      bl > 0 ? `A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl}` : `L ${x} ${y + h}`,
      `L ${x} ${y + tl}`,
      tl > 0 ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}` : `L ${x} ${y}`,
      'Z',
    ].join(' ');
  });
}
