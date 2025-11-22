import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  effect,
  signal,
  AfterViewInit
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartData, getNumericDataValue } from '../core/types';
import { CHART_DATA } from '../context/chart-data.context';
import { ScaleService } from '../services/scale.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipService } from '../services/tooltip.service';
import { 
  line as d3Line, 
  area as d3Area, 
  curveLinear, 
  curveLinearClosed,
  curveMonotoneX, 
  curveMonotoneY,
  curveCardinal, 
  curveBasis, 
  curveBasisClosed,
  curveBasisOpen,
  curveBundle,
  curveNatural,
  curveStep, 
  curveStepBefore, 
  curveStepAfter,
  CurveFactory 
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
    @if (!hide() && finalPoints().length > 0) {
      <!-- Animation clip path definition -->
      @if (animationClipPath()) {
        <svg:defs>
          <svg:clipPath [attr.id]="'area-animation-clip-' + (id() || 'default')">
            <svg:rect
              [attr.x]="animationClipPath()!.x"
              [attr.y]="animationClipPath()!.y"
              [attr.width]="animationClipPath()!.width"
              [attr.height]="animationClipPath()!.height" />
          </svg:clipPath>
        </svg:defs>
      }
      
      <!-- Area and line with optional clipping -->
      <svg:g [attr.clip-path]="animationClipPath() ? 'url(#area-animation-clip-' + (id() || 'default') + ')' : null">
        <!-- Area path -->
        <svg:path
          class="recharts-area-area"
          [attr.d]="areaPath()"
          [attr.fill]="fill()"
          [attr.fill-opacity]="fillOpacity()"
          [attr.stroke]="stroke()"
          [attr.stroke-width]="strokeWidth()"
          (click)="handleClick($event)"
          (mousedown)="handleMouseDown($event)"
          (mouseup)="handleMouseUp($event)"
          (mousemove)="handleMouseMove($event)"
          (mouseover)="handleMouseOver($event)"
          (mouseout)="handleMouseOut($event)"
          (mouseenter)="handleMouseEnter($event)"
          (mouseleave)="handleMouseLeave($event)" />
        
        <!-- Line path -->
        @if (stroke() !== 'none') {
          <svg:path
            class="recharts-area-curve"
            [attr.d]="linePath()"
            [attr.stroke]="stroke()"
            [attr.stroke-width]="strokeWidth()"
            [attr.fill]="'none'" />
        }
      </svg:g>
      
      <!-- Regular Dots -->
      @if (shouldShowDots()) {
        @for (point of finalPoints(); track $index) {
          <svg:circle
            class="recharts-area-dot"
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
export class AreaComponent implements AfterViewInit {
  private store = inject(Store);
  private chartDataContext = inject(CHART_DATA, { optional: true });
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private tooltipService = inject(TooltipService, { optional: true });

  ngAfterViewInit() {
    // No specific initialization needed yet, but required by interface
  }
  
  // Core recharts API inputs
  dataKey = input.required<string>();
  data = input<ChartData[]>([]);
  
  // Interpolation type - full recharts compatibility
  type = input<'basis' | 'basisClosed' | 'basisOpen' | 'bumpX' | 'bumpY' | 'bump' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter' | 'cardinal' | CurveFactory>('linear');
  
  // Axis IDs
  xAxisId = input<string | number>(0);
  yAxisId = input<string | number>(0);
  
  // Legend
  legendType = input<'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none'>('line');
  
  // Dot configuration
  dot = input<boolean | Record<string, any> | any>(false);
  activeDot = input<boolean | Record<string, any> | any>(true);
  
  // Label configuration
  label = input<boolean | Record<string, any> | any>(false);
  
  // Styling
  stroke = input<string>('#3182bd');
  strokeWidth = input<string | number>(1);
  fill = input<string>('#8884d8');
  fillOpacity = input<number>(0.6);
  
  // Layout
  layout = input<'horizontal' | 'vertical'>('horizontal');
  
  // Baseline configuration
  baseLine = input<number | Array<{x: number, y: number}> | undefined>(undefined);
  baseValue = input<number | 'dataMin' | 'dataMax' | undefined>(undefined);
  
  // Points (usually calculated internally)
  points = input<AreaPoint[]>([]);
  
  // Stacking
  stackId = input<string | number | undefined>(undefined);
  
  // Data connection
  connectNulls = input<boolean>(false);
  
  // Visibility
  hide = input<boolean>(false);
  
  // Tooltip/Legend data
  unit = input<string | number | undefined>(undefined);
  name = input<string | number | undefined>(undefined);
  
  // Animation
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(1500);
  animationEasing = input<'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'>('ease');
  
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
  
  private startAnimation() {
    const animate = () => {
      if (this.isAnimationActive() && this.animationProgress() < 1) {
        this.animationTick.update(v => v + 1);
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }
  
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
  
  // Base value calculation (recharts compatible)
  calculatedBaseValue = computed(() => {
    const baseValue = this.baseValue();
    const data = this.data();
    const plotArea = this.plotArea();
    
    if (typeof baseValue === 'number') {
      return baseValue;
    }
    
    const yDomain = this.scaleService.getAutoDomain(data);
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);
    
    if (baseValue === 'dataMin') {
      return Math.min(...yDomain);
    }
    if (baseValue === 'dataMax') {
      return Math.max(...yDomain);
    }
    
    // Default: use 0 or domain min if all values are positive
    const domainMax = Math.max(...yDomain);
    const domainMin = Math.min(...yDomain);
    return domainMax < 0 ? domainMax : Math.max(domainMin, 0);
  });
  
  // Computed properties
  calculatedPoints = computed(() => {
    const inputData = this.data();
    const contextData = this.chartDataContext?.data() || [];
    const data = inputData.length > 0 ? inputData : contextData;

    const dataKey = this.dataKey();
    const plotArea = this.plotArea();
    const stackId = this.stackId();
    
    if (!data.length || plotArea.width <= 0 || plotArea.height <= 0) return [];
    
    // Create scales using D3 - Area charts use linear scale for even distribution
    // Use auto domain to match Y-axis behavior when no specific dataKey is set for Y-axis
    const yDomain = this.scaleService.getAutoDomain(data);
    
    // For Area charts, use linear scale to distribute points evenly across width
    const xScale = this.scaleService.createLinearScale([0, data.length - 1], [0, plotArea.width]);
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);
    
    const baseValue = this.calculatedBaseValue();
    
    return data.map((item, index) => {
      let rawValue = getNumericDataValue(item, dataKey);
      let processedValue: number | [number, number];
      
      // Handle stacking (simplified - in full recharts this would be more complex)
      if (stackId) {
        // For stacked areas, we would need to calculate cumulative values
        // This is a simplified version
        processedValue = [baseValue, rawValue];
      } else if (!Array.isArray(rawValue)) {
        processedValue = [baseValue, rawValue];
      } else {
        processedValue = rawValue;
      }
      
      // Use index-based positioning for even distribution
      const x = xScale(index);
      const finalValue = Array.isArray(processedValue) ? processedValue[1] : processedValue;
      const y = yScale(finalValue);
      
      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        value: finalValue,
        payload: item
      };
    });
  });
  
  // Use provided points or calculated points
  finalPoints = computed(() => {
    const providedPoints = this.points();
    return providedPoints.length > 0 ? providedPoints : this.calculatedPoints();
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
    
    // Convert tooltip coordinate to plot area coordinate
    let plotX = tooltipX;
    if (this.responsiveService) {
      const offset = this.responsiveService.totalOffset();
      plotX = tooltipX - offset.left;
    } else {
      const margin = this.margin();
      plotX = tooltipX - margin.left;
    }

    let closestIndex = -1;
    let minDistance = Infinity;

    points.forEach((point, index) => {
      const distance = Math.abs(point.x - plotX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  });
  
  // Get curve function based on type
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
  
  linePath = computed(() => {
    const points = this.finalPoints();
    if (points.length === 0) return '';
    
    const line = d3Line<AreaPoint>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(this.getCurveFunction());
    
    return line(points) || '';
  });
  
  // Calculate baseline for area
  calculatedBaseLine = computed(() => {
    const baseLine = this.baseLine();
    const points = this.finalPoints();
    const plotArea = this.plotArea();
    const baseValue = this.calculatedBaseValue();
    
    if (typeof baseLine === 'number') {
      return baseLine;
    }
    
    if (Array.isArray(baseLine)) {
      return baseLine;
    }
    
    // Default baseline calculation
    const yDomain = this.scaleService.getAutoDomain(this.data());
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);
    
    return yScale(baseValue);
  });
  
  // Animation clip path dimensions
  animationClipPath = computed(() => {
    const points = this.finalPoints();
    const progress = this.animationProgress();
    const plotArea = this.plotArea();
    
    if (!this.isAnimationActive() || progress >= 1 || points.length === 0) {
      return null; // No clipping needed
    }
    
    // Calculate clip rectangle for left-to-right reveal animation
    const startX = points[0].x;
    const endX = points[points.length - 1].x;
    const totalWidth = Math.abs(endX - startX);
    const animatedWidth = totalWidth * progress;
    
    return {
      x: Math.min(startX, endX),
      y: 0,
      width: animatedWidth,
      height: plotArea.height
    };
  });
  
  areaPath = computed(() => {
    const points = this.finalPoints();
    const baseLine = this.calculatedBaseLine();
    
    if (points.length === 0) return '';
    
    const area = d3Area<AreaPoint>()
      .x(d => d.x)
      .y0(typeof baseLine === 'number' ? baseLine : this.plotArea().height)
      .y1(d => d.y)
      .curve(this.getCurveFunction());
    
    return area(points) || '';
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
  
  // Get active point for tooltip
  getActivePoint(): AreaPoint | null {
    const index = this.activePointIndex();
    const points = this.finalPoints();
    return index >= 0 && index < points.length ? points[index] : null;
  }
  
  // Animation event handlers
  handleAnimationStart() {
    this.onAnimationStart.emit(null);
  }
  
  handleAnimationEnd() {
    this.onAnimationEnd.emit(null);
  }
}