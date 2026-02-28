import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { ChartDataService } from '../services/chart-data.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { AxisRegistryService } from '../services/axis-registry.service';

export interface ErrorBarItem {
  x: number;
  y: number;
  errorHeight: number;
}

@Component({
  selector: 'svg:g[ngx-error-bar]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (bar of resolvedErrorBars(); track $index) {
      <!-- center line -->
      <svg:line
        [attr.x1]="bar.x"
        [attr.y1]="bar.y - bar.errorHeight"
        [attr.x2]="bar.x"
        [attr.y2]="bar.y + bar.errorHeight"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
      />
      <!-- top cap -->
      <svg:line
        [attr.x1]="bar.x - width() / 2"
        [attr.y1]="bar.y - bar.errorHeight"
        [attr.x2]="bar.x + width() / 2"
        [attr.y2]="bar.y - bar.errorHeight"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
      />
      <!-- bottom cap -->
      <svg:line
        [attr.x1]="bar.x - width() / 2"
        [attr.y1]="bar.y + bar.errorHeight"
        [attr.x2]="bar.x + width() / 2"
        [attr.y2]="bar.y + bar.errorHeight"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
      />
    }
  `,
})
export class ErrorBarComponent {
  private chartDataService = inject(ChartDataService, { optional: true });
  private responsiveContainerService = inject(ResponsiveContainerService, { optional: true });
  private axisRegistry = inject(AxisRegistryService, { optional: true });

  dataKey = input.required<string>();
  direction = input<'x' | 'y' | 'both'>('y');
  width = input<number>(5);
  stroke = input<string>('#333');
  strokeWidth = input<number>(1.5);
  errorBars = input<ErrorBarItem[]>([]);
  xAxisId = input<string>('0');
  yAxisId = input<string>('0');

  resolvedErrorBars = computed((): ErrorBarItem[] => {
    // If explicit errorBars provided, use them directly
    const explicit = this.errorBars();
    if (explicit.length > 0) return explicit;

    // Otherwise compute from chart data
    const data = this.chartDataService?.data() ?? [];
    const dk = this.dataKey();

    if (!data.length || !dk) return [];

    const xScale = this.axisRegistry?.getXAxisScale(this.xAxisId());
    const yScale = this.axisRegistry?.getYAxisScale(this.yAxisId());

    if (!xScale || !yScale) return [];

    return data.map((item, index) => {
      const errorValue = (item as Record<string, unknown>)[dk];
      if (errorValue == null) return null;

      // Error can be a number (symmetric) or [low, high] (asymmetric)
      let errorLow: number, errorHigh: number;
      if (Array.isArray(errorValue)) {
        errorLow = Number(errorValue[0]);
        errorHigh = Number(errorValue[1]);
      } else {
        errorLow = errorHigh = Number(errorValue);
      }

      // Position: use band scale for x (center of band), linear scale for y
      const categoryKey = 'name'; // default category key
      const xPos = typeof xScale.bandwidth === 'function'
        ? (xScale(String((item as Record<string, unknown>)[categoryKey] ?? '')) ?? 0) + xScale.bandwidth() / 2
        : xScale(index);

      // For y-direction errors: convert error values to pixel heights
      const yVal = yScale(errorHigh) - yScale(0);
      const errorHeight = Math.abs(yVal);

      // The y position is where the main data point would be (center of error range)
      const mainY = yScale((errorLow + errorHigh) / 2);

      return { x: Number(xPos), y: Number(mainY), errorHeight };
    }).filter((bar): bar is ErrorBarItem => bar !== null);
  });
}
