import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  line,
  area,
  curveBasis,
  curveBasisClosed,
  curveBasisOpen,
  curveBumpX,
  curveBumpY,
  curveBundle,
  curveCardinal,
  curveCardinalClosed,
  curveCardinalOpen,
  curveCatmullRom,
  curveCatmullRomClosed,
  curveCatmullRomOpen,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from 'd3-shape';

export type CurveType =
  | 'basis'
  | 'basisClosed'
  | 'basisOpen'
  | 'bumpX'
  | 'bumpY'
  | 'bundle'
  | 'cardinal'
  | 'cardinalClosed'
  | 'cardinalOpen'
  | 'catmullRom'
  | 'catmullRomClosed'
  | 'catmullRomOpen'
  | 'linear'
  | 'linearClosed'
  | 'monotoneX'
  | 'monotoneY'
  | 'natural'
  | 'step'
  | 'stepAfter'
  | 'stepBefore';

export interface CurvePoint {
  x: number;
  y: number;
}

const CURVE_MAP: Record<CurveType, any> = {
  basis: curveBasis,
  basisClosed: curveBasisClosed,
  basisOpen: curveBasisOpen,
  bumpX: curveBumpX,
  bumpY: curveBumpY,
  bundle: curveBundle,
  cardinal: curveCardinal,
  cardinalClosed: curveCardinalClosed,
  cardinalOpen: curveCardinalOpen,
  catmullRom: curveCatmullRom,
  catmullRomClosed: curveCatmullRomClosed,
  catmullRomOpen: curveCatmullRomOpen,
  linear: curveLinear,
  linearClosed: curveLinearClosed,
  monotoneX: curveMonotoneX,
  monotoneY: curveMonotoneY,
  natural: curveNatural,
  step: curveStep,
  stepAfter: curveStepAfter,
  stepBefore: curveStepBefore,
};

@Component({
  selector: 'svg:g[ngx-curve]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pathData()) {
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
export class CurveComponent {
  type = input<CurveType>('linear');
  points = input<CurvePoint[]>([]);
  baseLine = input<number | CurvePoint[] | undefined>(undefined);
  connectNulls = input<boolean>(false);
  fill = input<string>('none');
  stroke = input<string>('#333');
  strokeWidth = input<number>(1);
  className = input<string>('');
  layout = input<'horizontal' | 'vertical'>('horizontal');

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
    const points = this.points();
    if (points.length === 0) return '';

    const curveFn = CURVE_MAP[this.type()] ?? curveLinear;
    const baseLineValue = this.baseLine();
    const isVertical = this.layout() === 'vertical';

    if (baseLineValue !== undefined) {
      // Render as area
      const areaGenerator = area<CurvePoint>().curve(curveFn);

      if (typeof baseLineValue === 'number') {
        if (isVertical) {
          areaGenerator
            .x0(baseLineValue)
            .x1(d => d.x)
            .y(d => d.y);
        } else {
          areaGenerator
            .x(d => d.x)
            .y0(baseLineValue)
            .y1(d => d.y);
        }
        return areaGenerator(points) ?? '';
      } else {
        // baseLine is an array of points
        const basePoints = baseLineValue as CurvePoint[];
        if (isVertical) {
          areaGenerator
            .x0((_, i) => basePoints[i]?.x ?? 0)
            .x1(d => d.x)
            .y(d => d.y);
        } else {
          areaGenerator
            .x(d => d.x)
            .y0((_, i) => basePoints[i]?.y ?? 0)
            .y1(d => d.y);
        }
        return areaGenerator(points) ?? '';
      }
    } else {
      // Render as line
      const lineGenerator = line<CurvePoint>()
        .x(d => d.x)
        .y(d => d.y)
        .curve(curveFn);
      return lineGenerator(points) ?? '';
    }
  });
}
