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
  
  // Inputs
  dataKey = input.required<string>();
  data = input<ChartData[]>([]);
  fill = input<string>('#8884d8');
  stroke = input<string>('none');
  strokeWidth = input<number>(0);
  hide = input<boolean>(false);
  
  // Chart dimensions
  chartWidth = input<number>(400);
  chartHeight = input<number>(300);
  
  // Chart margins
  margin = input<{top: number, right: number, bottom: number, left: number}>({
    top: 20, right: 30, bottom: 40, left: 40
  });
  
  // Plot area calculation
  plotArea = computed(() => {
    const margin = this.margin();
    const width = this.chartWidth();
    const height = this.chartHeight();
    
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
    const yDomain = this.scaleService.getLinearDomain(data, dataKey);
    
    const xScale = this.scaleService.createBandScale(xDomain, [0, plotArea.width]);
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);
    
    return data.map((item, index) => {
      const value = getNumericDataValue(item, dataKey);
      const categoryValue = String(item['name'] || '');
      
      // Use D3 scales for positioning
      const x = xScale(categoryValue) || 0;
      const width = xScale.bandwidth();
      const y = yScale(value);
      const height = plotArea.height - y;
      
      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        width: Number(width.toFixed(1)),
        height: Number(height.toFixed(1)),
        value,
        payload: item
      };
    });
  });
}