import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AxisRegistryService } from '../services/axis-registry.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { RectangleComponent } from '../shape/rectangle.component';

@Component({
  selector: 'svg:g[ngx-reference-area]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RectangleComponent],
  template: `
    @if (rectCoords(); as coords) {
      <svg:g
        ngx-rectangle
        [x]="coords.x"
        [y]="coords.y"
        [width]="coords.width"
        [height]="coords.height"
        [fill]="fill()"
        [stroke]="stroke()"
        [strokeWidth]="1"
        [attr.fill-opacity]="fillOpacity()"
        [attr.stroke-opacity]="strokeOpacity()"
      />
      @if (label()) {
        <svg:text
          class="recharts-label"
          [attr.x]="coords.x + coords.width / 2"
          [attr.y]="coords.y + coords.height / 2"
          text-anchor="middle"
          dominant-baseline="central"
          fill="#666"
        >{{ label() }}</svg:text>
      }
    }
  `,
})
export class ReferenceAreaComponent {
  private axisRegistry = inject(AxisRegistryService, { optional: true });
  private responsiveService = inject(ResponsiveContainerService, { optional: true });

  x1 = input<any>(undefined);
  x2 = input<any>(undefined);
  y1 = input<any>(undefined);
  y2 = input<any>(undefined);
  xAxisId = input<string>('0');
  yAxisId = input<string>('0');
  fill = input<string>('#ccc');
  fillOpacity = input<number>(0.5);
  stroke = input<string>('none');
  strokeOpacity = input<number>(1);
  label = input<string | undefined>(undefined);
  ifOverflow = input<string>('discard');

  private plotWidth = computed(() => this.responsiveService?.plotWidth() ?? 400);
  private plotHeight = computed(() => this.responsiveService?.plotHeight() ?? 300);

  private toPixelX(value: any): number | null {
    const scale = this.axisRegistry?.getXAxisScale(this.xAxisId());
    if (scale) {
      const px = scale(value);
      return px != null ? Number(px) : null;
    }
    return typeof value === 'number' ? value : null;
  }

  private toPixelY(value: any): number | null {
    const scale = this.axisRegistry?.getYAxisScale(this.yAxisId());
    if (scale) {
      const px = scale(value);
      return px != null ? Number(px) : null;
    }
    return typeof value === 'number' ? value : null;
  }

  rectCoords = computed((): { x: number; y: number; width: number; height: number } | null => {
    const width = this.plotWidth();
    const height = this.plotHeight();

    const x1Val = this.x1();
    const x2Val = this.x2();
    const y1Val = this.y1();
    const y2Val = this.y2();

    let left = 0;
    let right = width;
    let top = 0;
    let bottom = height;

    if (x1Val != null) {
      const px = this.toPixelX(x1Val);
      if (px == null) return null;
      left = px;
    }
    if (x2Val != null) {
      const px = this.toPixelX(x2Val);
      if (px == null) return null;
      right = px;
    }
    if (y1Val != null) {
      const py = this.toPixelY(y1Val);
      if (py == null) return null;
      top = py;
    }
    if (y2Val != null) {
      const py = this.toPixelY(y2Val);
      if (py == null) return null;
      bottom = py;
    }

    const x = Math.min(left, right);
    const y = Math.min(top, bottom);
    const w = Math.abs(right - left);
    const h = Math.abs(bottom - top);

    if (w <= 0 || h <= 0) return null;

    return { x, y, width: w, height: h };
  });
}
