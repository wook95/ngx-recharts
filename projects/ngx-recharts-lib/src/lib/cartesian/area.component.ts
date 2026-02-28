import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { ChartData, getNumericDataValue } from '../core/types';
import { ScaleService } from '../services/scale.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { createChartDimensions } from '../shared/chart-dimensions';
import { ChartDataService } from '../services/chart-data.service';
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
export class AreaComponent implements OnDestroy {
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private registryService = inject(GraphicalItemRegistryService, { optional: true });
  private chartDataService = inject(ChartDataService, { optional: true });

  private static nextId = 0;
  private readonly itemId = `area-${AreaComponent.nextId++}`;
  
  constructor() {
    effect(() => {
      this.registryService?.replace(this.itemId, {
        id: this.itemId,
        type: 'area',
        dataKey: this.dataKey(),
        name: this.name()?.toString(),
        fill: this.fill(),
        stroke: this.stroke(),
        fillOpacity: this.fillOpacity(),
        xAxisId: this.xAxisId(),
        yAxisId: this.yAxisId(),
        hide: this.hide(),
        stackId: this.stackId(),
      });
    });
  }
  
  ngOnDestroy(): void {
    this.registryService?.unregister(this.itemId);
  }

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
  name = input<string | number | undefined>(undefined);
  xAxisId = input<string | number>(0);
  yAxisId = input<string | number>(0);
  stackId = input<string | undefined>(undefined);
  categoryKey = input<string>('name');

  // Chart dimensions
  chartWidth = input<number>(400);
  chartHeight = input<number>(300);

  // Chart margins
  margin = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 20, right: 30, bottom: 40, left: 40
  });

  private dims = createChartDimensions(
    this.responsiveService,
    this.chartWidth,
    this.chartHeight,
    this.margin
  );

  actualWidth = this.dims.actualWidth;
  actualHeight = this.dims.actualHeight;
  plotArea = this.dims.plotArea;
  
  resolvedData = computed(() => {
    const explicit = this.data();
    return explicit.length > 0 ? explicit : (this.chartDataService?.data() ?? []);
  });

  // Computed properties
  points = computed(() => {
    const data = this.resolvedData();
    const dataKey = this.dataKey();
    const plotArea = this.plotArea();

    if (!data.length || plotArea.width <= 0 || plotArea.height <= 0) return [];

    const yDomain = this.chartDataService?.unifiedYDomain()
      ?? this.scaleService.getLinearDomain(data, dataKey);
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);

    // Check if we are in a ComposedChart with bars -- use band-center positioning
    const hasBars = this.registryService && this.registryService.getItemsByType('bar').length > 0;

    // Create scale once outside the loop
    const ck = this.registryService?.categoryKey() ?? this.categoryKey();
    const xScale = hasBars
      ? null
      : this.scaleService.createLinearScale([0, data.length - 1], [0, plotArea.width]);
    const bandScale = hasBars
      ? this.scaleService.createBandScale(
          data.map(d => String(d[ck] || '')),
          [0, plotArea.width]
        )
      : null;

    return data.map((item, index) => {
      const value = getNumericDataValue(item, dataKey);

      let x: number;
      if (bandScale) {
        // ComposedChart with bars: position at band center
        const bandX = bandScale(String(item[ck] || '')) ?? 0;
        x = bandX + bandScale.bandwidth() / 2;
      } else {
        // Standalone AreaChart or ComposedChart without bars: linear scale
        x = xScale!(index);
      }

      const y = yScale(value);

      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        value,
        payload: item,
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