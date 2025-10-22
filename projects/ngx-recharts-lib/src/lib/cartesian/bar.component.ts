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

export interface BarRect {
  x: number;
  y: number;
  width: number;
  height: number;
  value: any;
  payload: ChartData;
}

@Component({
  selector: 'svg:g[ngx-bar]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!hide() && bars().length > 0) {
      @for (bar of bars(); track $index) {
        <svg:rect
          class="recharts-bar-rectangle"
          [attr.x]="bar.x"
          [attr.y]="bar.y"
          [attr.width]="bar.width"
          [attr.height]="bar.height"
          [attr.fill]="fill()"
          [attr.stroke]="stroke()"
          [attr.stroke-width]="strokeWidth()" />
      }
    }
  `
})
export class BarComponent {
  private store = inject(Store);
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  
  // Inputs
  dataKey = input.required<string>();
  data = input<ChartData[]>([]);
  fill = input<string>('#8884d8');
  stroke = input<string>('none');
  strokeWidth = input<number>(0);
  hide = input<boolean>(false);
  
  // Multi-series support
  barIndex = input<number>(0);  // Index of this bar in the series
  barCount = input<number>(1);  // Total number of bars in the series
  
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
  margin = input<{top: number, right: number, bottom: number, left: number}>({
    top: 20, right: 30, bottom: 40, left: 40
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
      y: margin.top
    };
  });
  
  // Computed properties
  bars = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const plotArea = this.plotArea();
    
    if (!data.length || plotArea.width <= 0 || plotArea.height <= 0) return [];
    
    // Create scales using D3
    const xDomain = this.scaleService.getCategoryDomain(data, 'name');
    // Use auto domain to match Y-axis behavior when no specific dataKey is set for Y-axis
    const yDomain = this.scaleService.getAutoDomain(data);
    
    const xScale = this.scaleService.createBandScale(xDomain, [0, plotArea.width]);
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);
    
    const barIndex = this.barIndex();
    const barCount = this.barCount();
    
    return data.map((item, index) => {
      const value = getNumericDataValue(item, dataKey);
      const categoryValue = String(item['name'] || '');
      
      // Use D3 scales for positioning
      const bandX = xScale(categoryValue) || 0;
      const bandWidth = xScale.bandwidth();
      
      // Calculate individual bar width and position for multi-series
      const barWidth = bandWidth / barCount;
      const x = bandX + (barIndex * barWidth);
      
      const y = yScale(value);
      const height = plotArea.height - y;
      
      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        width: Number(barWidth.toFixed(1)),
        height: Number(height.toFixed(1)),
        value,
        payload: item
      };
    });
  });
}