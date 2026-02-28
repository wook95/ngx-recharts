import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { PolarCoordinateService } from '../services/polar-coordinate.service';
import { AxisType } from '../core/axis-types';

export type PolarRadiusAxisOrientation = 'left' | 'right' | 'middle';
export type PolarRadiusAxisScale = 'auto' | 'linear' | 'pow' | 'sqrt' | 'log';
export type PolarRadiusDomain = [number, number] | 'auto';

@Component({
  selector: 'svg:g[ngx-polar-radius-axis]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (axisLine()) {
      <svg:line
        [attr.x1]="centerX()"
        [attr.y1]="centerY()"
        [attr.x2]="endPoint().x"
        [attr.y2]="endPoint().y"
        [attr.stroke]="stroke()"
        stroke-width="1"
        fill="none"
      />
    }

    @if (tick()) {
      @for (t of ticks(); track t.index) {
        <svg:text
          [attr.x]="t.x"
          [attr.y]="t.y"
          [attr.fill]="fill()"
          [attr.font-size]="fontSize()"
          [attr.text-anchor]="textAnchor()"
          dominant-baseline="central"
        >{{ t.label }}</svg:text>
      }
    }

    @if (label()) {
      <svg:text
        [attr.x]="labelPoint().x"
        [attr.y]="labelPoint().y"
        [attr.fill]="fill()"
        [attr.font-size]="fontSize()"
        [attr.text-anchor]="textAnchor()"
        dominant-baseline="central"
      >{{ label() }}</svg:text>
    }
  `,
})
export class PolarRadiusAxisComponent {
  private readonly polarService = inject(PolarCoordinateService, { optional: true });

  // Inputs
  angle = input<number>(90);
  cx = input<number | undefined>(undefined);
  cy = input<number | undefined>(undefined);
  type = input<AxisType>('number');
  domain = input<PolarRadiusDomain>('auto');
  tickCount = input<number>(5);
  tick = input<boolean>(true);
  tickFormatter = input<((value: any, index: number) => string) | null>(null);
  axisLine = input<boolean>(true);
  label = input<string | undefined>(undefined);
  orientation = input<PolarRadiusAxisOrientation>('left');
  stroke = input<string>('#ccc');
  fill = input<string>('#666');
  fontSize = input<number>(12);
  scale = input<PolarRadiusAxisScale>('auto');

  // Resolved center coordinates
  readonly centerX = computed(() => this.cx() ?? this.polarService?.cx() ?? 0);
  readonly centerY = computed(() => this.cy() ?? this.polarService?.cy() ?? 0);

  // Radii from service
  private readonly innerRadius = computed(() => this.polarService?.innerRadius() ?? 0);
  private readonly outerRadius = computed(() => this.polarService?.outerRadius() ?? 100);

  // Angle in radians (recharts convention: angle=90 points downward, same as service)
  private readonly angleRad = computed(() => (this.angle() - 90) * Math.PI / 180);

  // Endpoint of the axis line (at outerRadius)
  readonly endPoint = computed(() => ({
    x: this.centerX() + this.outerRadius() * Math.cos(this.angleRad()),
    y: this.centerY() + this.outerRadius() * Math.sin(this.angleRad()),
  }));

  // Label position (slightly beyond outerRadius)
  readonly labelPoint = computed(() => {
    const offset = 16;
    const r = this.outerRadius() + offset;
    return {
      x: this.centerX() + r * Math.cos(this.angleRad()),
      y: this.centerY() + r * Math.sin(this.angleRad()),
    };
  });

  // Text anchor based on orientation
  readonly textAnchor = computed(() => {
    const o = this.orientation();
    if (o === 'left') return 'end';
    if (o === 'right') return 'start';
    return 'middle';
  });

  // Ticks along the radius axis
  readonly ticks = computed(() => {
    const count = this.tickCount();
    const inner = this.innerRadius();
    const outer = this.outerRadius();
    const cx = this.centerX();
    const cy = this.centerY();
    const rad = this.angleRad();
    const formatter = this.tickFormatter();

    const result: Array<{ index: number; x: number; y: number; label: string }> = [];

    for (let i = 0; i < count; i++) {
      const fraction = count > 1 ? i / (count - 1) : 0;
      const radius = inner + (outer - inner) * fraction;
      const x = cx + radius * Math.cos(rad);
      const y = cy + radius * Math.sin(rad);
      const rawValue = radius;
      const label = formatter
        ? formatter(rawValue, i)
        : String(Math.round(rawValue));

      result.push({ index: i, x, y, label });
    }

    return result;
  });
}
