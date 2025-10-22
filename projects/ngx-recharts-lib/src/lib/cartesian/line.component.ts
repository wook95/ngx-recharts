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
import { TooltipService } from '../services/tooltip.service';

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
export class LineComponent {
  private store = inject(Store);
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private tooltipService = inject(TooltipService, { optional: true });

  // Core recharts API inputs
  dataKey = input.required<string>();
  data = input<ChartData[]>([]);

  // Interpolation type
  type = input<'basis' | 'basisClosed' | 'basisOpen' | 'bumpX' | 'bumpY' | 'bump' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter' | Function>('linear');

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

  // Tooltip/Legend data
  unit = input<string | number | undefined>(undefined);
  name = input<string | number | undefined>(undefined);

  // Animation
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(1500);
  animationEasing = input<'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'>('ease');

  // Unique ID
  id = input<string | undefined>(undefined);

  // Event handlers
  onAnimationStart = input<Function | undefined>(undefined);
  onAnimationEnd = input<Function | undefined>(undefined);
  onClick = input<Function | undefined>(undefined);
  onMouseDown = input<Function | undefined>(undefined);
  onMouseUp = input<Function | undefined>(undefined);
  onMouseMove = input<Function | undefined>(undefined);
  onMouseOver = input<Function | undefined>(undefined);
  onMouseOut = input<Function | undefined>(undefined);
  onMouseEnter = input<Function | undefined>(undefined);
  onMouseLeave = input<Function | undefined>(undefined);

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
  calculatedPoints = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const plotArea = this.plotArea();

    if (!data.length || plotArea.width <= 0 || plotArea.height <= 0) return [];

    // Create scales using D3 - Line charts use linear scale for even distribution
    // Use auto domain to match Y-axis behavior when no specific dataKey is set for Y-axis
    const yDomain = this.scaleService.getAutoDomain(data);

    // For Line charts, use linear scale to distribute points evenly across width
    const xScale = this.scaleService.createLinearScale([0, data.length - 1], [0, plotArea.width]);
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);

    return data.map((item, index) => {
      const value = getNumericDataValue(item, dataKey as string);

      // Use index-based positioning for even distribution
      const x = xScale(index);
      const y = yScale(value);

      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        value,
        payload: item,
      };
    });
  });

  // Use provided points or calculated points
  finalPoints = computed(() => {
    const providedPoints = this.points();
    return providedPoints.length > 0 ? providedPoints : this.calculatedPoints();
  });

  linePath = computed(() => {
    const points = this.finalPoints();
    if (points.length === 0) return '';

    // Start path
    let path = `M ${points[0].x},${points[0].y}`;

    // Add line segments based on interpolation type
    const interpolationType = this.type();

    if (interpolationType === 'step') {
      // Step interpolation
      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currPoint = points[i];
        path += ` L ${currPoint.x},${prevPoint.y} L ${currPoint.x},${currPoint.y}`;
      }
    } else if (interpolationType === 'stepBefore') {
      // Step before interpolation
      for (let i = 1; i < points.length; i++) {
        const currPoint = points[i];
        path += ` L ${currPoint.x},${points[i-1].y} L ${currPoint.x},${currPoint.y}`;
      }
    } else if (interpolationType === 'stepAfter') {
      // Step after interpolation
      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currPoint = points[i];
        path += ` L ${prevPoint.x},${currPoint.y} L ${currPoint.x},${currPoint.y}`;
      }
    } else {
      // Linear and other interpolations (default to linear for now)
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x},${points[i].y}`;
      }
    }

    return path;
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

    // Find the closest point to the tooltip coordinate
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
    const handler = this.onClick();
    if (handler) handler(event);
  }

  handleMouseDown(event: Event) {
    const handler = this.onMouseDown();
    if (handler) handler(event);
  }

  handleMouseUp(event: Event) {
    const handler = this.onMouseUp();
    if (handler) handler(event);
  }

  handleMouseMove(event: Event) {
    const handler = this.onMouseMove();
    if (handler) handler(event);
  }

  handleMouseOver(event: Event) {
    const handler = this.onMouseOver();
    if (handler) handler(event);
  }

  handleMouseOut(event: Event) {
    const handler = this.onMouseOut();
    if (handler) handler(event);
  }

  handleMouseEnter(event: Event) {
    const handler = this.onMouseEnter();
    if (handler) handler(event);
  }

  handleMouseLeave(event: Event) {
    const handler = this.onMouseLeave();
    if (handler) handler(event);
  }

  // Get active point for tooltip
  getActivePoint(): LinePoint | null {
    const index = this.activePointIndex();
    const points = this.finalPoints();
    return index >= 0 && index < points.length ? points[index] : null;
  }
}
