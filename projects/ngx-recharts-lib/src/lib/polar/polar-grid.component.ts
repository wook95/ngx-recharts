import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { PolarCoordinateService } from '../services/polar-coordinate.service';

@Component({
  selector: 'svg:g[ngx-polar-grid]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Radial lines from center to outerRadius -->
    @for (line of radialLines(); track line.angle) {
      <svg:line
        class="recharts-polar-grid-angle"
        [attr.x1]="actualCx()"
        [attr.y1]="actualCy()"
        [attr.x2]="line.x2"
        [attr.y2]="line.y2"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [attr.stroke-dasharray]="strokeDasharray()"
        fill="none"
      />
    }

    <!-- Concentric rings -->
    @for (r of computedPolarRadius(); track r) {
      @if (gridType() === 'circle') {
        <svg:circle
          class="recharts-polar-grid-concentric-circle"
          [attr.cx]="actualCx()"
          [attr.cy]="actualCy()"
          [attr.r]="r"
          [attr.stroke]="stroke()"
          [attr.stroke-width]="strokeWidth()"
          [attr.stroke-dasharray]="strokeDasharray()"
          fill="none"
        />
      } @else {
        <svg:polygon
          class="recharts-polar-grid-concentric-polygon"
          [attr.points]="polygonPoints(r)"
          [attr.stroke]="stroke()"
          [attr.stroke-width]="strokeWidth()"
          [attr.stroke-dasharray]="strokeDasharray()"
          fill="none"
        />
      }
    }
  `,
})
export class PolarGridComponent {
  private polarService = inject(PolarCoordinateService, { optional: true });

  // Inputs
  cx = input<number | undefined>(undefined);
  cy = input<number | undefined>(undefined);
  innerRadius = input<number>(0);
  outerRadius = input<number | undefined>(undefined);
  polarAngles = input<number[]>([]);
  polarRadius = input<number[]>([]);
  gridType = input<'polygon' | 'circle'>('polygon');
  stroke = input<string>('#ccc');
  strokeWidth = input<number>(1);
  strokeDasharray = input<string>('');
  radialLineCount = input<number>(6);
  concentricCount = input<number>(5);

  // Resolved center and radius from input or service
  actualCx = computed(() => {
    const val = this.cx();
    if (val !== undefined) return val;
    return this.polarService?.cx() ?? 0;
  });

  actualCy = computed(() => {
    const val = this.cy();
    if (val !== undefined) return val;
    return this.polarService?.cy() ?? 0;
  });

  actualOuterRadius = computed(() => {
    const val = this.outerRadius();
    if (val !== undefined) return val;
    return this.polarService?.outerRadius() ?? 0;
  });

  // Computed angles: use polarAngles if provided, else generate evenly spaced
  computedPolarAngles = computed(() => {
    const angles = this.polarAngles();
    if (angles.length > 0) return angles;
    const count = this.radialLineCount();
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      result.push((360 / count) * i);
    }
    return result;
  });

  // Computed radii: use polarRadius if provided, else generate evenly spaced
  computedPolarRadius = computed(() => {
    const radii = this.polarRadius();
    if (radii.length > 0) return radii;
    const count = this.concentricCount();
    const inner = this.innerRadius();
    const outer = this.actualOuterRadius();
    if (outer <= 0) return [];
    const step = (outer - inner) / count;
    const result: number[] = [];
    for (let i = 1; i <= count; i++) {
      result.push(inner + step * i);
    }
    return result;
  });

  // Precomputed radial line endpoints
  radialLines = computed(() => {
    const cx = this.actualCx();
    const cy = this.actualCy();
    const outer = this.actualOuterRadius();
    return this.computedPolarAngles().map((angle) => {
      const radian = ((angle - 90) * Math.PI) / 180;
      return {
        angle,
        x2: cx + outer * Math.cos(radian),
        y2: cy + outer * Math.sin(radian),
      };
    });
  });

  // Helper: compute SVG polygon points string for a given radius
  polygonPoints(radius: number): string {
    const cx = this.actualCx();
    const cy = this.actualCy();
    const angles = this.computedPolarAngles();
    return angles
      .map((angle) => {
        const radian = ((angle - 90) * Math.PI) / 180;
        const x = cx + radius * Math.cos(radian);
        const y = cy + radius * Math.sin(radian);
        return `${x},${y}`;
      })
      .join(' ');
  }
}
