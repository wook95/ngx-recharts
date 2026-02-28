import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'svg:g[ngx-polygon]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hasBaseLinePoints()) {
      <svg:path
        [attr.d]="areaPathData()"
        [attr.fill]="fill()"
        [attr.fill-opacity]="fillOpacity()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [class]="className()"
        [style]="animationStyle()" />
    } @else {
      <svg:path
        [attr.d]="pathData()"
        [attr.fill]="fill()"
        [attr.fill-opacity]="fillOpacity()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [class]="className()"
        [style]="animationStyle()" />
    }
  `,
})
export class PolygonComponent {
  points = input<Point[]>([]);
  baseLinePoints = input<Point[] | undefined>(undefined);
  connectNulls = input<boolean>(false);
  fill = input<string>('none');
  fillOpacity = input<number>(1);
  stroke = input<string>('#333');
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

  hasBaseLinePoints = computed(() => {
    const base = this.baseLinePoints();
    return base !== undefined && base.length > 0;
  });

  /** Path for plain polygon (outline or filled without baseline). */
  pathData = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return '';

    const commands = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`);
    commands.push('Z');
    return commands.join(' ');
  });

  /** Path for filled area between points and baseLinePoints. */
  areaPathData = computed(() => {
    const pts = this.points();
    const base = this.baseLinePoints();
    if (pts.length === 0 || !base || base.length === 0) return '';

    // Forward along points, then reverse along baseLinePoints to close the area.
    const forward = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`);
    const backward = [...base].reverse().map(p => `L ${p.x} ${p.y}`);
    return [...forward, ...backward, 'Z'].join(' ');
  });
}
