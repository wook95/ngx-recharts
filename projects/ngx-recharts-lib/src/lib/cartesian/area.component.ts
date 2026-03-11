import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
} from '@angular/core';
import { ChartData, getNumericDataValue } from '../core/types';
import { ChartMouseEvent } from '../core/event-types';
import { ScaleService } from '../services/scale.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { CHART_TOOLTIP_SERVICE } from '../core/chart-context.token';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { createChartDimensions } from '../shared/chart-dimensions';
import { ChartDataService } from '../services/chart-data.service';
import { ClipPathService } from '../services/clip-path.service';
import {
  line as d3Line,
  area as d3Area,
  curveLinear,
  curveMonotoneX,
  curveCardinal,
  curveBasis,
  curveStep,
  curveStepBefore,
  curveStepAfter,
  stack as d3Stack,
} from 'd3-shape';
import { getD3StackOffset } from '../shared/d3-helpers';

export interface AreaPoint {
  x: number;
  y: number;
  /** Baseline y-coordinate for stacked areas; equals plotArea.height when not stacked */
  y0: number;
  value: any;
  payload: ChartData;
}

@Component({
  selector: 'svg:g[ngx-area]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.clip-path]': 'clipPathService?.shouldClip() ? clipPathService.clipPathUrl() : null',
  },
  template: `
    @if (!hide() && points().length > 0) {
      <!-- Area path -->
      <svg:path
        class="recharts-area-area"
        [attr.d]="areaPath()"
        [attr.fill]="fill()"
        [attr.fill-opacity]="fillOpacity()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        (click)="handleAreaClick($event)"
        (mousedown)="handleAreaMouseDown($event)"
        (mouseup)="handleAreaMouseUp($event)"
        (mousemove)="handleAreaMouseMove($event)"
        (mouseover)="handleAreaMouseOver($event)"
        (mouseout)="handleAreaMouseOut($event)"
        (mouseenter)="handleAreaMouseEnter($event)"
        (mouseleave)="handleAreaMouseLeave($event)" />
      
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

      <!-- Active Dot (shown when tooltip is active) -->
      @if (shouldShowActiveDot() && activePointIndex() !== -1) {
        @let activePoint = points()[activePointIndex()];
        @if (activePoint) {
          <svg:circle
            class="recharts-area-active-dot"
            [attr.cx]="activePoint.x"
            [attr.cy]="activePoint.y"
            [attr.r]="activeDotProps().r || 6"
            [attr.fill]="activeDotProps().fill || '#fff'"
            [attr.stroke]="activeDotProps().stroke || stroke()"
            [attr.stroke-width]="activeDotProps().strokeWidth || 2" />
        }
      }
    }
  `
})
export class AreaComponent implements OnDestroy {
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private tooltipService = inject(CHART_TOOLTIP_SERVICE, { optional: true });
  private registryService = inject(GraphicalItemRegistryService, { optional: true });
  private chartDataService = inject(ChartDataService, { optional: true });
  clipPathService = inject(ClipPathService, { optional: true });

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
  connectNulls = input<boolean>(false);
  activeDot = input<boolean | Record<string, any> | any>(false);
  hide = input<boolean>(false);
  type = input<'linear' | 'monotone' | 'basis' | 'cardinal' | 'step' | 'stepBefore' | 'stepAfter'>('linear');
  name = input<string | number | undefined>(undefined);
  xAxisId = input<string | number>(0);
  yAxisId = input<string | number>(0);
  stackId = input<string | undefined>(undefined);
  categoryKey = input<string>('name');

  areaClick = output<ChartMouseEvent>();
  areaMouseDown = output<ChartMouseEvent>();
  areaMouseUp = output<ChartMouseEvent>();
  areaMouseMove = output<ChartMouseEvent>();
  areaMouseOver = output<ChartMouseEvent>();
  areaMouseOut = output<ChartMouseEvent>();
  areaMouseEnter = output<ChartMouseEvent>();
  areaMouseLeave = output<ChartMouseEvent>();

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

    const myStackId = this.stackId();
    const currentStackOffset = this.chartDataService?.stackOffset() ?? 'none';

    // d3-stack path: use d3 stack for non-default offset when stacked
    if (myStackId && currentStackOffset !== 'none') {
      const stackedAreas = this.registryService?.getItemsByType('area')
        .filter(item => !item.hide && item.stackId === myStackId) ?? [];
      const myStackIndex = stackedAreas.findIndex(item => item.id === this.itemId);
      const resolvedIndex = myStackIndex === -1 ? 0 : myStackIndex;

      const stackKeys = stackedAreas.map(a => a.dataKey);
      const d3OffsetFn = getD3StackOffset(currentStackOffset);

      const stackGenerator = d3Stack<ChartData>()
        .keys(stackKeys)
        .value((d, key) => getNumericDataValue(d, key))
        .offset(d3OffsetFn);

      const stackedSeries = stackGenerator(data);
      const mySeries = stackedSeries[resolvedIndex];
      if (!mySeries) return [];

      // Compute y-scale domain from stacked data
      let stackMin = Infinity;
      let stackMax = -Infinity;
      for (const series of stackedSeries) {
        for (const point of series) {
          if (point[0] < stackMin) stackMin = point[0];
          if (point[1] > stackMax) stackMax = point[1];
        }
      }
      const stackYScale = this.scaleService.createLinearScale(
        [Math.min(0, stackMin), stackMax],
        [plotArea.height, 0]
      );

      const connectNulls = this.connectNulls();
      const mappedPoints = data.map((item, index) => {
        const value = getNumericDataValue(item, dataKey);
        const [y0Val, y1Val] = mySeries[index];

        let x: number;
        if (bandScale) {
          const bandX = bandScale(String(item[ck] || '')) ?? 0;
          x = bandX + bandScale.bandwidth() / 2;
        } else {
          x = xScale!(index);
        }

        return {
          x: Number(x.toFixed(1)),
          y: Number(stackYScale(y1Val).toFixed(1)),
          y0: Number(stackYScale(y0Val).toFixed(1)),
          value,
          payload: item,
        };
      });

      if (connectNulls) {
        return mappedPoints.filter(p => p.value != null && !isNaN(p.value));
      }
      return mappedPoints;
    }

    // Default path: no d3 stack (preserves existing behavior)
    const connectNulls = this.connectNulls();
    const mappedPoints = data.map((item, index) => {
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
        y0: plotArea.height,
        value,
        payload: item,
      };
    });

    if (connectNulls) {
      return mappedPoints.filter(p => p.value != null && !isNaN(p.value));
    }
    return mappedPoints;
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

    if (points.length === 0) return '';

    const area = d3Area<AreaPoint>()
      .x(d => d.x)
      .y0(d => d.y0)  // baseline: per-point y0 (plotArea.height for non-stacked, stacked baseline otherwise)
      .y1(d => d.y)    // top line follows data
      .curve(this.getCurveFunction());

    return area(points) || '';
  });

  // Active dot configuration
  shouldShowActiveDot = computed(() => {
    return this.activeDot() !== false;
  });

  activeDotProps = computed(() => {
    const config = this.activeDot();
    if (typeof config === 'object' && config !== null) {
      return config;
    }
    return { r: 6, stroke: this.stroke(), strokeWidth: 2, fill: '#fff' };
  });

  // Active point index from tooltip service
  activePointIndex = computed(() => {
    if (!this.tooltipService) return -1;

    const isActive = this.tooltipService.active();
    if (!isActive) return -1;

    const points = this.points();
    const tooltipX = this.tooltipService.coordinate().x;

    let closestIndex = -1;
    let minDistance = Infinity;

    points.forEach((point, index) => {
      const distance = Math.abs(point.x - tooltipX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  });

  handleAreaClick(event: MouseEvent) {
    this.areaClick.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleAreaMouseEnter(event: MouseEvent) {
    this.areaMouseEnter.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleAreaMouseDown(event: MouseEvent) {
    this.areaMouseDown.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleAreaMouseUp(event: MouseEvent) {
    this.areaMouseUp.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleAreaMouseMove(event: MouseEvent) {
    this.areaMouseMove.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleAreaMouseOver(event: MouseEvent) {
    this.areaMouseOver.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleAreaMouseOut(event: MouseEvent) {
    this.areaMouseOut.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleAreaMouseLeave(event: MouseEvent) {
    this.areaMouseLeave.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    });
  }
}