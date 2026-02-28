import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { ChartDataService } from '../services/chart-data.service';
import { PolarCoordinateService } from '../services/polar-coordinate.service';

const LABEL_OFFSET = 5;
const DEG_TO_RAD = Math.PI / 180;

@Component({
  selector: 'svg:g[ngx-polar-angle-axis]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g class="recharts-polar-angle-axis">
      @if (axisLine()) {
        @if (axisLineType() === 'circle') {
          <svg:circle
            class="recharts-polar-angle-axis-line"
            [attr.cx]="resolvedCx()"
            [attr.cy]="resolvedCy()"
            [attr.r]="resolvedRadius()"
            [attr.stroke]="stroke()"
            fill="none"
          />
        } @else {
          @if (polygonPoints()) {
            <svg:polygon
              class="recharts-polar-angle-axis-line"
              [attr.points]="polygonPoints()"
              [attr.stroke]="stroke()"
              fill="none"
            />
          }
        }
      }

      @for (tickItem of computedTicks(); track tickItem.index) {
        @if (tickLine()) {
          <svg:line
            class="recharts-polar-angle-axis-tick-line"
            [attr.x1]="tickItem.lineX1"
            [attr.y1]="tickItem.lineY1"
            [attr.x2]="tickItem.lineX2"
            [attr.y2]="tickItem.lineY2"
            [attr.stroke]="stroke()"
            fill="none"
          />
        }
        @if (tick()) {
          <svg:text
            class="recharts-polar-angle-axis-tick-value"
            [attr.x]="tickItem.labelX"
            [attr.y]="tickItem.labelY"
            [attr.text-anchor]="tickItem.textAnchor"
            [attr.dominant-baseline]="tickItem.dominantBaseline"
            [attr.fill]="fill()"
            [attr.font-size]="fontSize()"
          >{{ tickItem.label }}</svg:text>
        }
      }
    </svg:g>
  `,
})
export class PolarAngleAxisComponent {
  private readonly polarService = inject(PolarCoordinateService, { optional: true });
  private readonly chartDataService = inject(ChartDataService, { optional: true });

  // Required input
  dataKey = input.required<string>();

  // Optional coordinate inputs (fall back to PolarCoordinateService)
  cx = input<number | undefined>(undefined);
  cy = input<number | undefined>(undefined);
  radius = input<number | undefined>(undefined);

  // Visual options
  axisLine = input<boolean>(true);
  axisLineType = input<'polygon' | 'circle'>('polygon');
  tickLine = input<boolean>(true);
  tick = input<boolean>(true);
  ticks = input<any[] | undefined>(undefined);
  orient = input<'outer' | 'inner'>('outer');
  tickFormatter = input<((value: any, index: number) => string) | null>(null);
  type = input<'number' | 'category'>('category');
  stroke = input<string>('#666');
  fill = input<string>('#666');
  fontSize = input<number>(12);

  // Resolved center / radius from service or explicit inputs
  resolvedCx = computed(() => this.cx() ?? this.polarService?.cx() ?? 0);
  resolvedCy = computed(() => this.cy() ?? this.polarService?.cy() ?? 0);
  resolvedRadius = computed(() => {
    const explicit = this.radius();
    if (explicit !== undefined) return explicit;
    const outerRadius = this.polarService?.outerRadius() ?? 0;
    return outerRadius + LABEL_OFFSET;
  });

  // Axis-line radius (always at outerRadius, not the label radius)
  private axisRadius = computed(() => this.polarService?.outerRadius() ?? this.resolvedRadius());

  // Tick values derived from data or explicit ticks input
  private tickValues = computed<any[]>(() => {
    const explicit = this.ticks();
    if (explicit && explicit.length > 0) return explicit;

    const data = this.chartDataService?.data() ?? [];
    const key = this.dataKey();
    if (!data.length) return [];

    const seen = new Set<any>();
    const result: any[] = [];
    for (const item of data) {
      const val = item[key];
      if (!seen.has(val)) {
        seen.add(val);
        result.push(val);
      }
    }
    return result;
  });

  // Start angle from service (degrees, recharts convention: 0 = top, clockwise)
  private startAngle = computed(() => this.polarService?.startAngle() ?? 0);

  // Polygon points string for axis line
  polygonPoints = computed(() => {
    const vals = this.tickValues();
    if (!vals.length) return null;
    const cx = this.resolvedCx();
    const cy = this.resolvedCy();
    const r = this.axisRadius();
    const start = this.startAngle();
    const count = vals.length;
    const points: string[] = vals.map((_, i) => {
      const angleDeg = (360 / count) * i + start;
      const rad = (angleDeg - 90) * DEG_TO_RAD;
      const x = cx + r * Math.cos(rad);
      const y = cy + r * Math.sin(rad);
      return `${x},${y}`;
    });
    return points.join(' ');
  });

  // All tick rendering data
  computedTicks = computed(() => {
    const vals = this.tickValues();
    if (!vals.length) return [];

    const cx = this.resolvedCx();
    const cy = this.resolvedCy();
    const axisR = this.axisRadius();
    const labelR = this.resolvedRadius();
    const start = this.startAngle();
    const count = vals.length;
    const formatter = this.tickFormatter();
    const tickLineLen = 5;

    return vals.map((value, i) => {
      const angleDeg = (360 / count) * i + start;
      const rad = (angleDeg - 90) * DEG_TO_RAD;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      // Tick line: from axisRadius outward by tickLineLen
      const lineX1 = cx + axisR * cosA;
      const lineY1 = cy + axisR * sinA;
      const lineX2 = cx + (axisR + tickLineLen) * cosA;
      const lineY2 = cy + (axisR + tickLineLen) * sinA;

      // Label position
      const labelX = cx + labelR * cosA;
      const labelY = cy + labelR * sinA;

      // text-anchor based on horizontal position relative to center
      const xDiff = labelX - cx;
      const textAnchor =
        Math.abs(xDiff) < 1 ? 'middle' : xDiff > 0 ? 'start' : 'end';

      // dominant-baseline based on vertical position
      const yDiff = labelY - cy;
      const dominantBaseline =
        Math.abs(yDiff) < 1 ? 'middle' : yDiff > 0 ? 'hanging' : 'auto';

      const label = formatter ? formatter(value, i) : String(value);

      return { index: i, lineX1, lineY1, lineX2, lineY2, labelX, labelY, textAnchor, dominantBaseline, label };
    });
  });
}
