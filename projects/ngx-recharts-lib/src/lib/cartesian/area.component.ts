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
import { 
  line as d3Line, 
  area as d3Area, 
  curveLinear, 
  curveMonotoneX, 
  curveCardinal, 
  curveBasis, 
  curveStep, 
  curveStepBefore, 
  curveStepAfter 
} from 'd3-shape';

export interface AreaPoint {
  x: number;
  y: number;
  value: any;
  payload: ChartData;
}

@Component({
  selector: 'svg:g[ngx-area]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!hide() && points().length > 0) {
      <!-- Area path -->
      <svg:path
        class="recharts-area-area"
        [attr.d]="areaPath()"
        [attr.fill]="fill()"
        [attr.fill-opacity]="fillOpacity()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()" />
      
      <!-- Line path -->
      @if (stroke() !== 'none') {
        <svg:path
          class="recharts-area-curve"
          [attr.d]="linePath()"
          [attr.stroke]="stroke()"
          [attr.stroke-width]="strokeWidth()"
          [attr.fill]="'none'" />
      }
      
      <!-- Dots -->
      @if (dot()) {
        @for (point of points(); track $index) {
          <svg:circle
            class="recharts-area-dot"
            [attr.cx]="point.x"
            [attr.cy]="point.y"
            [attr.r]="dotSize()"
            [attr.fill]="stroke()"
            [attr.stroke]="'#fff'"
            [attr.stroke-width]="1" />
        }
      }
    }
  `
})
export class AreaComponent {
  private store = inject(Store);
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  
  // Inputs
  dataKey = input.required<string>();
  data = input<ChartData[]>([]);
  fill = input<string>('#8884d8');
  fillOpacity = input<number>(0.6);
  stroke = input<string>('#8884d8');
  strokeWidth = input<number>(1);
  dot = input<boolean>(false);
  dotSize = input<number>(3);
  hide = input<boolean>(false);
  type = input<'linear' | 'monotone' | 'basis' | 'cardinal' | 'step' | 'stepBefore' | 'stepAfter'>('linear');
  
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
  points = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const plotArea = this.plotArea();
    
    if (!data.length || plotArea.width <= 0 || plotArea.height <= 0) return [];
    
    // Create scales using D3 - Area charts use linear scale for even distribution
    // Use auto domain to match Y-axis behavior when no specific dataKey is set for Y-axis
    const yDomain = this.scaleService.getAutoDomain(data);
    
    // For Area charts, use linear scale to distribute points evenly across width
    const xScale = this.scaleService.createLinearScale([0, data.length - 1], [0, plotArea.width]);
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);
    
    return data.map((item, index) => {
      const value = getNumericDataValue(item, dataKey);
      
      // Use index-based positioning for even distribution
      const x = xScale(index);
      const y = yScale(value);
      
      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        value,
        payload: item
      };
    });
  });
  
  // Get curve function based on type
  private getCurveFunction() {
    const type = this.type();
    switch (type) {
      case 'monotone': return curveMonotoneX;
      case 'basis': return curveBasis;
      case 'cardinal': return curveCardinal;
      case 'step': return curveStep;
      case 'stepBefore': return curveStepBefore;
      case 'stepAfter': return curveStepAfter;
      default: return curveLinear;
    }
  }
  
  linePath = computed(() => {
    const points = this.points();
    if (points.length === 0) return '';
    
    const line = d3Line<AreaPoint>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(this.getCurveFunction());
    
    return line(points) || '';
  });
  
  areaPath = computed(() => {
    const points = this.points();
    const plotArea = this.plotArea();
    
    if (points.length === 0) return '';
    
    const area = d3Area<AreaPoint>()
      .x(d => d.x)
      .y0(plotArea.height)  // baseline at bottom
      .y1(d => d.y)         // top line follows data
      .curve(this.getCurveFunction());
    
    return area(points) || '';
  });
}