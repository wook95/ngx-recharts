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
import { line as d3Line, curveLinear, curveMonotoneX, curveCardinal, curveBasis, curveStep, curveStepBefore, curveStepAfter, curveBasisClosed, curveBasisOpen, curveLinearClosed, curveBumpX, curveBumpY, curveNatural, curveMonotoneY } from 'd3-shape';
import { ChartData, getNumericDataValue } from '../core/types';
import { ChartMouseEvent } from '../core/event-types';
import { ScaleService } from '../services/scale.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { CHART_TOOLTIP_SERVICE } from '../core/chart-context.token';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { createChartDimensions } from '../shared/chart-dimensions';
import { ChartDataService } from '../services/chart-data.service';

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
    @if (!hide() && finalPoints().length > 0) {
      <!-- Line path -->
      <svg:path
        class="recharts-line-curve"
        [attr.d]="linePath()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [attr.stroke-dasharray]="strokeDasharray()"
        [attr.fill]="fill()"
        [style]="animationStyle()"
        stroke-linejoin="round"
        stroke-linecap="round"
        (click)="handleClick($event)"
        (mousedown)="handleMouseDown($event)"
        (mouseup)="handleMouseUp($event)"
        (mousemove)="handleMouseMove($event)"
        (mouseover)="handleMouseOver($event)"
        (mouseout)="handleMouseOut($event)"
        (mouseenter)="handleMouseEnter($event)"
        (mouseleave)="handleMouseLeave($event)" />

      <!-- Regular Dots -->
      @if (shouldShowDots()) {
        @for (point of finalPoints(); track $index) {
          <svg:circle
            class="recharts-line-dot"
            [attr.cx]="point.x"
            [attr.cy]="point.y"
            [attr.r]="dotProps().r || 3"
            [attr.fill]="dotProps().fill || stroke()"
            [attr.stroke]="dotProps().stroke || '#fff'"
            [attr.stroke-width]="dotProps().strokeWidth || 1" />
        }
      }

      <!-- Active Dot (shown when tooltip is active) -->
      @if (shouldShowActiveDot() && activePointIndex() !== -1) {
        @let activePoint = finalPoints()[activePointIndex()];
        @if (activePoint) {
          <svg:circle
            class="recharts-line-active-dot"
            [attr.cx]="activePoint.x"
            [attr.cy]="activePoint.y"
            [attr.r]="activeDotProps().r || 6"
            [attr.fill]="activeDotProps().fill || '#fff'"
            [attr.stroke]="activeDotProps().stroke || stroke()"
            [attr.stroke-width]="activeDotProps().strokeWidth || 2" />
        }
      }
    }
  `,
})
export class LineComponent implements OnDestroy {
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private tooltipService = inject(CHART_TOOLTIP_SERVICE, { optional: true });
  private registryService = inject(GraphicalItemRegistryService, { optional: true });
  private chartDataService = inject(ChartDataService, { optional: true });

  private static nextId = 0;
  private readonly itemId = `line-${LineComponent.nextId++}`;

  constructor() {
    effect(() => {
      this.registryService?.replace(this.itemId, {
        id: this.itemId,
        type: 'line',
        dataKey: this.dataKey(),
        name: this.name()?.toString(),
        stroke: this.stroke(),
        xAxisId: this.xAxisId(),
        yAxisId: this.yAxisId(),
        hide: this.hide(),
        strokeWidth: typeof this.strokeWidth() === 'number'
          ? this.strokeWidth() as number
          : parseInt(this.strokeWidth() as string, 10) || 1,
      });
    });
  }

  ngOnDestroy(): void {
    this.registryService?.unregister(this.itemId);
  }

  // Core recharts API inputs
  dataKey = input.required<string>();
  data = input<ChartData[]>([]);

  // Interpolation type
  type = input<'basis' | 'basisClosed' | 'basisOpen' | 'bumpX' | 'bumpY' | 'bump' | 'cardinal' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter' | ((context: any) => any)>('linear');

  // Axis IDs
  xAxisId = input<string | number>(0);
  yAxisId = input<string | number>(0);

  // Legend
  legendType = input<'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none'>('line');

  // Dot configuration
  dot = input<boolean | Record<string, any> | any>(true);
  activeDot = input<boolean | Record<string, any> | any>(true);

  // Label configuration
  label = input<boolean | Record<string, any> | any>(false);

  // Visibility
  hide = input<boolean>(false);

  // Points (usually calculated internally)
  points = input<LinePoint[]>([]);

  // Styling
  stroke = input<string>('#3182bd');
  strokeWidth = input<string | number>(1);
  strokeDasharray = input<string | undefined>(undefined);
  fill = input<string>('none');

  // Layout
  layout = input<'horizontal' | 'vertical'>('horizontal');

  // Data connection
  connectNulls = input<boolean>(false);

  // Category key for band scale lookup
  categoryKey = input<string>('name');

  // Tooltip/Legend data
  unit = input<string | number | undefined>(undefined);
  name = input<string | number | undefined>(undefined);

  // Animation
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(1500);
  animationEasing = input<'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'>('ease');

  animationStyle = computed(() => {
    if (!this.isAnimationActive()) return {};
    const delay = `${this.animationBegin()}ms`;
    const duration = `${this.animationDuration()}ms`;
    const easing = this.animationEasing();
    return { transition: `all ${duration} ${easing} ${delay}` };
  });

  // Unique ID
  id = input<string | undefined>(undefined);

  // Event handlers
  onAnimationStart = input<(() => void) | undefined>(undefined);
  onAnimationEnd = input<(() => void) | undefined>(undefined);
  /** @deprecated Use (lineClick) output instead */
  onClick = input<((event: Event) => void) | undefined>(undefined);
  /** @deprecated Use (lineMouseDown) output instead */
  onMouseDown = input<((event: MouseEvent) => void) | undefined>(undefined);
  /** @deprecated Use (lineMouseUp) output instead */
  onMouseUp = input<((event: MouseEvent) => void) | undefined>(undefined);
  /** @deprecated Use (lineMouseMove) output instead */
  onMouseMove = input<((event: MouseEvent) => void) | undefined>(undefined);
  /** @deprecated Use (lineMouseOver) output instead */
  onMouseOver = input<((event: MouseEvent) => void) | undefined>(undefined);
  /** @deprecated Use (lineMouseOut) output instead */
  onMouseOut = input<((event: MouseEvent) => void) | undefined>(undefined);
  /** @deprecated Use (lineMouseEnter) output instead */
  onMouseEnter = input<((event: MouseEvent) => void) | undefined>(undefined);
  /** @deprecated Use (lineMouseLeave) output instead */
  onMouseLeave = input<((event: MouseEvent) => void) | undefined>(undefined);

  // Angular output() event emitters (preferred API)
  lineClick = output<ChartMouseEvent>();
  lineMouseDown = output<ChartMouseEvent>();
  lineMouseUp = output<ChartMouseEvent>();
  lineMouseMove = output<ChartMouseEvent>();
  lineMouseOver = output<ChartMouseEvent>();
  lineMouseOut = output<ChartMouseEvent>();
  lineMouseEnter = output<ChartMouseEvent>();
  lineMouseLeave = output<ChartMouseEvent>();

  // Chart dimensions
  chartWidth = input<number>(400);
  chartHeight = input<number>(300);

  // Chart margins
  margin = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 20,
    right: 30,
    bottom: 40,
    left: 40,
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
  calculatedPoints = computed(() => {
    const data = this.resolvedData();
    const dataKey = this.dataKey();
    const plotArea = this.plotArea();

    if (!data.length || plotArea.width <= 0 || plotArea.height <= 0) return [];

    const yDomain = this.chartDataService?.unifiedYDomain()
      ?? this.scaleService.getLinearDomain(data, dataKey as string);
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

    const mappedPoints = data.map((item, index) => {
      const value = getNumericDataValue(item, dataKey as string);

      let x: number;
      if (bandScale) {
        // ComposedChart with bars: position at band center
        const bandX = bandScale(String(item[ck] || '')) ?? 0;
        x = bandX + bandScale.bandwidth() / 2;
      } else {
        // Standalone LineChart or ComposedChart without bars: linear scale
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

    const connectNulls = this.connectNulls();
    if (connectNulls) {
      return mappedPoints.filter(p => p.value != null && !isNaN(p.value));
    }
    return mappedPoints;
  });

  // Use provided points or calculated points
  finalPoints = computed(() => {
    const providedPoints = this.points();
    return providedPoints.length > 0 ? providedPoints : this.calculatedPoints();
  });

  private getCurveFunction() {
    const type = this.type();
    switch (type) {
      case 'basis': return curveBasis;
      case 'basisClosed': return curveBasisClosed;
      case 'basisOpen': return curveBasisOpen;
      case 'bumpX': return curveBumpX;
      case 'bumpY': return curveBumpY;
      case 'bump': return curveBumpX;
      case 'cardinal': return curveCardinal;
      case 'linearClosed': return curveLinearClosed;
      case 'natural': return curveNatural;
      case 'monotoneX': return curveMonotoneX;
      case 'monotoneY': return curveMonotoneY;
      case 'monotone': return curveMonotoneX;
      case 'step': return curveStep;
      case 'stepBefore': return curveStepBefore;
      case 'stepAfter': return curveStepAfter;
      default: return curveLinear;
    }
  }

  linePath = computed(() => {
    const points = this.finalPoints();
    if (points.length === 0) return '';
    const curveType = this.type();
    const curveFn = typeof curveType === 'function' ? curveType : this.getCurveFunction();
    const lineGen = d3Line<LinePoint>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(curveFn);
    if (!this.connectNulls()) {
      lineGen.defined(d => d.value != null && !isNaN(d.value));
    }
    return lineGen(points) || '';
  });

  // Dot configuration
  shouldShowDots = computed(() => {
    const dotConfig = this.dot();
    return dotConfig !== false;
  });

  dotProps = computed(() => {
    const dotConfig = this.dot();
    if (typeof dotConfig === 'object' && dotConfig !== null) {
      return dotConfig;
    }
    return {};
  });

  // Active dot configuration
  shouldShowActiveDot = computed(() => {
    const activeDotConfig = this.activeDot();
    return activeDotConfig !== false;
  });

  activeDotProps = computed(() => {
    const activeDotConfig = this.activeDot();
    if (typeof activeDotConfig === 'object' && activeDotConfig !== null) {
      return activeDotConfig;
    }
    return { r: 6, stroke: this.stroke(), strokeWidth: 2, fill: '#fff' };
  });

  // Active point index from tooltip service
  activePointIndex = computed(() => {
    if (!this.tooltipService) {
      return -1;
    }

    const isActive = this.tooltipService.active();
    if (!isActive) {
      return -1;
    }

    const points = this.finalPoints();
    const tooltipCoordinate = this.tooltipService.coordinate();
    const tooltipX = tooltipCoordinate.x;

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

  // Event handler methods
  handleClick(event: Event) {
    const chartEvent: ChartMouseEvent = {
      nativeEvent: event as MouseEvent,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    };
    this.lineClick.emit(chartEvent);
    this.onClick()?.(event);
  }

  handleMouseDown(event: MouseEvent) {
    const chartEvent: ChartMouseEvent = {
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    };
    this.lineMouseDown.emit(chartEvent);
    this.onMouseDown()?.(event);
  }

  handleMouseUp(event: MouseEvent) {
    const chartEvent: ChartMouseEvent = {
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    };
    this.lineMouseUp.emit(chartEvent);
    this.onMouseUp()?.(event);
  }

  handleMouseMove(event: MouseEvent) {
    const chartEvent: ChartMouseEvent = {
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    };
    this.lineMouseMove.emit(chartEvent);
    this.onMouseMove()?.(event);
  }

  handleMouseOver(event: MouseEvent) {
    const chartEvent: ChartMouseEvent = {
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    };
    this.lineMouseOver.emit(chartEvent);
    this.onMouseOver()?.(event);
  }

  handleMouseOut(event: MouseEvent) {
    const chartEvent: ChartMouseEvent = {
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    };
    this.lineMouseOut.emit(chartEvent);
    this.onMouseOut()?.(event);
  }

  handleMouseEnter(event: MouseEvent) {
    const chartEvent: ChartMouseEvent = {
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    };
    this.lineMouseEnter.emit(chartEvent);
    this.onMouseEnter()?.(event);
  }

  handleMouseLeave(event: MouseEvent) {
    const chartEvent: ChartMouseEvent = {
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: this.resolvedData(),
      index: 0,
    };
    this.lineMouseLeave.emit(chartEvent);
    this.onMouseLeave()?.(event);
  }

  // Get active point for tooltip
  getActivePoint(): LinePoint | null {
    const index = this.activePointIndex();
    const points = this.finalPoints();
    return index >= 0 && index < points.length ? points[index] : null;
  }
}
