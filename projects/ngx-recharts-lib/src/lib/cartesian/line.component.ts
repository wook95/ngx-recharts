import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  effect,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartData, getNumericDataValue } from '../core/types';
import { ScaleService } from '../services/scale.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipService } from '../services/tooltip.service';
import { 
  line as d3Line, 
  curveLinear, 
  curveLinearClosed,
  curveMonotoneX, 
  curveMonotoneY,
  curveCardinal, 
  curveBasis, 
  curveBasisClosed,
  curveBasisOpen,
  curveNatural,
  curveStep, 
  curveStepBefore, 
  curveStepAfter,
  CurveFactory 
} from 'd3-shape';

export interface LinePoint {
  x: number;
  y: number | null;
  value: any;
  payload: ChartData;
}

@Component({
  selector: 'svg:g[ngx-line]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!hide() && finalPoints().length > 0) {
      <!-- Line path with animation support -->
      <svg:path
        #pathElement
        class="recharts-line-curve"
        [attr.d]="linePath()"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [attr.stroke-dasharray]="animatedStrokeDasharray()"
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
          @if (point.y !== null) {
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
      }
      
      <!-- Labels -->
      @if (shouldShowLabels()) {
        @for (point of finalPoints(); track $index) {
          @if (point.y !== null) {
            <svg:text
              class="recharts-line-label"
              [attr.x]="getLabelX(point)"
              [attr.y]="getLabelY(point)"
              [attr.text-anchor]="getLabelTextAnchor()"
              [attr.dominant-baseline]="getLabelBaseline()"
              [attr.fill]="getLabelFill()"
              [attr.font-size]="getLabelFontSize()">
              {{ getLabelText(point) }}
            </svg:text>
          }
        }
      }

      <!-- Active Dot (shown when tooltip is active) -->
      @if (shouldShowActiveDot() && activePointIndex() !== -1) {
        @let activePoint = finalPoints()[activePointIndex()];
        @if (activePoint && activePoint.y !== null) {
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
export class LineComponent implements AfterViewInit {
  private store = inject(Store);
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private tooltipService = inject(TooltipService, { optional: true });

  // Core recharts API inputs
  dataKey = input.required<string>();
  data = input<ChartData[]>([]);

  // Interpolation type
  type = input<'basis' | 'basisClosed' | 'basisOpen' | 'bumpX' | 'bumpY' | 'bump' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter' | 'cardinal' | Function>('linear');

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

  // Event outputs (Angular style)
  onAnimationStart = output<any>();
  onAnimationEnd = output<any>();
  onClick = output<any>();
  onMouseDown = output<any>();
  onMouseUp = output<any>();
  onMouseMove = output<any>();
  onMouseOver = output<any>();
  onMouseOut = output<any>();
  onMouseEnter = output<any>();
  onMouseLeave = output<any>();
  
  // Animation progress tracking
  private animationStartTime = Date.now();
  private animationTick = signal(0);
  
  // Animation progress (0 to 1)
  animationProgress = computed(() => {
    this.animationTick();
    
    if (!this.isAnimationActive()) {
      return 1;
    }
    
    const elapsed = Date.now() - this.animationStartTime;
    const duration = this.animationDuration();
    const delay = this.animationBegin();
    
    if (elapsed < delay) {
      return 0;
    }
    
    const progress = Math.min((elapsed - delay) / duration, 1);
    
    const easing = this.animationEasing();
    switch (easing) {
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return 1 - Math.pow(1 - progress, 2);
      case 'ease-in-out':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case 'linear':
      default:
        return progress;
    }
  });
  
  constructor() {
    effect(() => {
      this.data();
      if (this.isAnimationActive()) {
        this.animationStartTime = Date.now();
        this.startAnimation();
      }
    });
  }
  
  ngAfterViewInit() {
    // Set path reference after view initialization
    if (this.pathElement?.nativeElement) {
      this.pathRef.set(this.pathElement.nativeElement);
    }
  }
  
  private startAnimation() {
    // Wait for path to be available
    const checkAndAnimate = () => {
      if (this.pathRef() && this.totalPathLength() > 0) {
        const animate = () => {
          if (this.isAnimationActive() && this.animationProgress() < 1) {
            this.animationTick.update(v => v + 1);
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      } else {
        // Retry after a short delay
        setTimeout(checkAndAnimate, 50);
      }
    };
    checkAndAnimate();
  }

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

  // Computed properties with connectNulls support
  calculatedPoints = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const plotArea = this.plotArea();
    const connectNulls = this.connectNulls();

    if (!data.length || plotArea.width <= 0 || plotArea.height <= 0) return [];

    // Create scales using D3 - Line charts use linear scale for even distribution
    // Use auto domain to match Y-axis behavior when no specific dataKey is set for Y-axis
    const yDomain = this.scaleService.getAutoDomain(data);

    // For Line charts, use linear scale to distribute points evenly across width
    const xScale = this.scaleService.createLinearScale([0, data.length - 1], [0, plotArea.width]);
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);

    return data.map((item, index) => {
      const value = getNumericDataValue(item, dataKey as string);
      
      // Handle null values based on connectNulls setting
      const isNull = value == null || isNaN(value);
      
      // Use index-based positioning for even distribution
      const x = xScale(index);
      const y = isNull ? null : yScale(value);

      return {
        x: Number(x.toFixed(1)),
        y: y !== null ? Number(y.toFixed(1)) : null,
        value: isNull ? null : value,
        payload: item,
      };
    });
  });

  // Use provided points or calculated points
  finalPoints = computed(() => {
    const providedPoints = this.points();
    return providedPoints.length > 0 ? providedPoints : this.calculatedPoints();
  });

  // Get curve function based on type (D3 integration)
  private getCurveFunction(): CurveFactory {
    const type = this.type();
    if (typeof type === 'function') {
      return type as CurveFactory;
    }
    
    switch (type) {
      case 'basis': return curveBasis;
      case 'basisClosed': return curveBasisClosed;
      case 'basisOpen': return curveBasisOpen;
      case 'linear': return curveLinear;
      case 'linearClosed': return curveLinearClosed;
      case 'natural': return curveNatural;
      case 'monotoneX': return curveMonotoneX;
      case 'monotoneY': return curveMonotoneY;
      case 'monotone': return curveMonotoneX;
      case 'step': return curveStep;
      case 'stepBefore': return curveStepBefore;
      case 'stepAfter': return curveStepAfter;
      case 'cardinal': return curveCardinal;
      // Note: bumpX, bumpY, bump are not standard d3-shape curves
      case 'bumpX':
      case 'bumpY':
      case 'bump':
        console.warn(`Curve type '${type}' not implemented, falling back to linear`);
        return curveLinear;
      default: return curveLinear;
    }
  }
  
  // SVG path reference for animation
  @ViewChild('pathElement', { static: false }) pathElement!: ElementRef<SVGPathElement>;
  private pathRef = signal<SVGPathElement | null>(null);
  
  // Calculate total path length for animation
  totalPathLength = computed(() => {
    const path = this.pathRef();
    if (!path) return 0;
    
    try {
      // Wait a bit for the path to be rendered
      setTimeout(() => {
        if (path && path.getTotalLength) {
          const length = path.getTotalLength();
          if (length > 0) {
            // Trigger recomputation when length is available
            this.animationTick.update(v => v + 1);
          }
        }
      }, 10);
      
      return path.getTotalLength() || 0;
    } catch {
      return 0;
    }
  });
  
  // Animated stroke dasharray for smooth line drawing
  animatedStrokeDasharray = computed(() => {
    const progress = this.animationProgress();
    const totalLength = this.totalPathLength();
    
    if (!this.isAnimationActive() || progress >= 1 || totalLength === 0) {
      return this.strokeDasharray() || undefined;
    }
    
    // Calculate current visible length
    const currentLength = totalLength * progress;
    const remainingLength = totalLength - currentLength;
    
    // Create dasharray: visible part + invisible part
    return `${currentLength}px ${remainingLength}px`;
  });
  
  linePath = computed(() => {
    const points = this.finalPoints();
    const connectNulls = this.connectNulls();
    
    if (points.length === 0) return '';
    
    // Filter out null points if connectNulls is false
    const validPoints = connectNulls 
      ? points 
      : points.filter(p => p.y !== null);
    
    if (validPoints.length === 0) return '';
    
    // Use D3 line generator for proper curve interpolation
    const line = d3Line<LinePoint>()
      .x(d => d.x)
      .y(d => d.y as number)
      .curve(this.getCurveFunction())
      .defined(d => d.y !== null);
    
    return line(validPoints) || '';
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
  
  // Label configuration
  shouldShowLabels = computed(() => {
    const labelConfig = this.label();
    return labelConfig !== false;
  });
  
  labelProps = computed(() => {
    const labelConfig = this.label();
    if (typeof labelConfig === 'object' && labelConfig !== null) {
      return labelConfig;
    }
    return {};
  });
  
  // Label positioning and styling methods
  getLabelX(point: LinePoint): number {
    return point.x;
  }
  
  getLabelY(point: LinePoint): number {
    const labelProps = this.labelProps();
    const position = labelProps.position || 'top';
    const y = point.y || 0;
    
    switch (position) {
      case 'top':
        return y - 5;
      case 'middle':
        return y;
      case 'bottom':
        return y + 15;
      default:
        return y - 5;
    }
  }
  
  getLabelTextAnchor(): string {
    return 'middle';
  }
  
  getLabelBaseline(): string {
    const labelProps = this.labelProps();
    const position = labelProps.position || 'top';
    
    switch (position) {
      case 'top':
        return 'text-after-edge';
      case 'middle':
        return 'central';
      case 'bottom':
        return 'hanging';
      default:
        return 'text-after-edge';
    }
  }
  
  getLabelFill(): string {
    const labelProps = this.labelProps();
    return labelProps.fill || '#666';
  }
  
  getLabelFontSize(): string {
    const labelProps = this.labelProps();
    return labelProps.fontSize || '12px';
  }
  
  getLabelText(point: LinePoint): string {
    const labelProps = this.labelProps();
    const formatter = labelProps.formatter;
    
    if (formatter && typeof formatter === 'function') {
      return formatter(point.value, point.payload);
    }
    
    const unit = this.unit();
    const value = point.value ?? '';
    return unit ? `${value}${unit}` : String(value);
  }

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
    this.onClick.emit(event);
  }

  handleMouseDown(event: Event) {
    this.onMouseDown.emit(event);
  }

  handleMouseUp(event: Event) {
    this.onMouseUp.emit(event);
  }

  handleMouseMove(event: Event) {
    this.onMouseMove.emit(event);
  }

  handleMouseOver(event: Event) {
    this.onMouseOver.emit(event);
  }

  handleMouseOut(event: Event) {
    this.onMouseOut.emit(event);
  }

  handleMouseEnter(event: Event) {
    this.onMouseEnter.emit(event);
  }

  handleMouseLeave(event: Event) {
    this.onMouseLeave.emit(event);
  }
  
  // Animation event handlers
  handleAnimationStart() {
    this.onAnimationStart.emit(null);
  }
  
  handleAnimationEnd() {
    this.onAnimationEnd.emit(null);
  }

  // Get active point for tooltip
  getActivePoint(): LinePoint | null {
    const index = this.activePointIndex();
    const points = this.finalPoints();
    const point = index >= 0 && index < points.length ? points[index] : null;
    return point as LinePoint | null;
  }
}
