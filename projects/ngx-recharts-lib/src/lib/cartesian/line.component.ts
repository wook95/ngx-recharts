import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartData, getNumericDataValue } from '../core/types';
import { ScaleService } from '../services/scale.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

export interface LinePoint {
  x: number;
  y: number;
  value: any;
  payload: ChartData;
}

@Component({
  selector: 'svg:g[ngx-line]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!hide() && points().length > 0) {
      <!-- Line path -->
      <svg:path
        class="recharts-line-curve"
        [attr.d]="linePath()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [attr.fill]="fill()"
        stroke-linejoin="round"
        stroke-linecap="round" />
      
      <!-- Dots -->
      @if (dot()) {
        @for (point of points(); track $index) {
          <svg:circle
            class="recharts-line-dot"
            [attr.cx]="point.x"
            [attr.cy]="point.y"
            [attr.r]="dotSize()"
            [attr.fill]="stroke()"
            [attr.stroke]="'#fff'"
            [attr.stroke-width]="1" />
        }
      }
    }
  `,
})
export class LineComponent {
  private store = inject(Store);
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });

  // Inputs
  dataKey = input.required<string>();
  data = input<ChartData[]>([]);
  stroke = input<string>('#8884d8');
  strokeWidth = input<number>(2);
  fill = input<string>('none');
  dot = input<boolean>(true);
  dotSize = input<number>(4);
  hide = input<boolean>(false);

  // Chart dimensions
  chartWidth = input<number>(400);
  chartHeight = input<number>(300);

  // Use responsive dimensions if available
  actualWidth = computed(() => {
    const responsiveWidth = this.responsiveService?.width() ?? 0;
    return responsiveWidth > 0 ? responsiveWidth : this.chartWidth();
  });
  
  actualHeight = computed(() => {
    const responsiveHeight = this.responsiveService?.height() ?? 0;
    return responsiveHeight > 0 ? responsiveHeight : this.chartHeight();
  });

  // Chart margins
  margin = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 20,
    right: 30,
    bottom: 40,
    left: 40,
  });

  // Plot area calculation - use responsive service plot area if available
  plotArea = computed(() => {
    const plotWidth = this.responsiveService?.plotWidth() ?? 0;
    const plotHeight = this.responsiveService?.plotHeight() ?? 0;
    
    if (plotWidth > 0 && plotHeight > 0) {
      return {
        width: plotWidth,
        height: plotHeight,
        x: 0,
        y: 0,
      };
    }
    
    // Fallback to manual calculation
    const margin = this.margin();
    const width = this.actualWidth();
    const height = this.actualHeight();

    return {
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
      x: margin.left,
      y: margin.top,
    };
  });

  // Computed properties
  points = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const plotArea = this.plotArea();

    if (!data.length || plotArea.width <= 0 || plotArea.height <= 0) return [];

    // Create scales using D3
    const xDomain = this.scaleService.getCategoryDomain(data, 'name');
    const yDomain = this.scaleService.getLinearDomain(data, dataKey);

    const xScale = this.scaleService.createBandScale(xDomain, [
      0,
      plotArea.width,
    ]);
    const yScale = this.scaleService.createLinearScale(yDomain, [
      plotArea.height,
      0,
    ]);

    return data.map((item, index) => {
      const value = getNumericDataValue(item, dataKey);
      const categoryValue = String(item['name'] || '');

      // Use D3 scales for positioning
      const x = (xScale(categoryValue) || 0) + xScale.bandwidth() / 2;
      const y = yScale(value);

      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        value,
        payload: item,
      };
    });
  });

  linePath = computed(() => {
    const points = this.points();
    if (points.length === 0) return '';

    // Start path
    let path = `M ${points[0].x},${points[0].y}`;

    // Add line segments
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }

    return path;
  });
}
