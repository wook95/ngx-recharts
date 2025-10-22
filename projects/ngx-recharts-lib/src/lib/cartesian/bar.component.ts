import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  effect,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartData, getNumericDataValue } from '../core/types';
import { ScaleService } from '../services/scale.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipService } from '../services/tooltip.service';

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
        <!-- Background Bar -->
        @if (shouldShowBackground()) {
          <svg:rect
            class="recharts-bar-background"
            [attr.x]="bar.x"
            [attr.y]="0"
            [attr.width]="bar.width"
            [attr.height]="plotArea().height"
            [attr.fill]="backgroundProps().fill || '#f0f0f0'"
            [attr.stroke]="backgroundProps().stroke || 'none'"
            [attr.stroke-width]="backgroundProps().strokeWidth || 0" />
        }
        
        <!-- Main Bar -->
        @if (shape()) {
          <!-- Custom Shape (placeholder for future implementation) -->
          <svg:rect
            class="recharts-bar-rectangle custom-shape"
            [class.active]="isActiveBar($index)"
            [attr.x]="bar.x"
            [attr.y]="animatedY($index, bar.y)"
            [attr.width]="bar.width"
            [attr.height]="animatedHeight($index, bar.height)"
            [attr.fill]="getBarFill($index)"
            [attr.stroke]="getBarStroke($index)"
            [attr.stroke-width]="getBarStrokeWidth($index)"
            [style.transition]="getAnimationStyle()"
            (click)="handleClick($event)"
            (mousedown)="handleMouseDown($event)"
            (mouseup)="handleMouseUp($event)"
            (mousemove)="handleMouseMove($event)"
            (mouseover)="handleMouseOver($event)"
            (mouseout)="handleMouseOut($event)"
            (mouseenter)="handleMouseEnter($event)"
            (mouseleave)="handleMouseLeave($event)" />
        } @else {
          <!-- Default Rectangle Shape -->
          @if (radius()) {
            <!-- Rounded Rectangle -->
            <svg:rect
              class="recharts-bar-rectangle"
              [class.active]="isActiveBar($index)"
              [attr.x]="bar.x"
              [attr.y]="animatedY($index, bar.y)"
              [attr.width]="bar.width"
              [attr.height]="animatedHeight($index, bar.height)"
              [attr.rx]="getRadius()"
              [attr.ry]="getRadius()"
              [attr.fill]="getBarFill($index)"
              [attr.stroke]="getBarStroke($index)"
              [attr.stroke-width]="getBarStrokeWidth($index)"
              [style.transition]="getAnimationStyle()"
              (click)="handleClick($event)"
              (mousedown)="handleMouseDown($event)"
              (mouseup)="handleMouseUp($event)"
              (mousemove)="handleMouseMove($event)"
              (mouseover)="handleMouseOver($event)"
              (mouseout)="handleMouseOut($event)"
              (mouseenter)="handleMouseEnter($event)"
              (mouseleave)="handleMouseLeave($event)" />
          } @else {
            <!-- Sharp Rectangle -->
            <svg:rect
              class="recharts-bar-rectangle"
              [class.active]="isActiveBar($index)"
              [attr.x]="bar.x"
              [attr.y]="animatedY($index, bar.y)"
              [attr.width]="bar.width"
              [attr.height]="animatedHeight($index, bar.height)"
              [attr.fill]="getBarFill($index)"
              [attr.stroke]="getBarStroke($index)"
              [attr.stroke-width]="getBarStrokeWidth($index)"
              [style.transition]="getAnimationStyle()"
              (click)="handleClick($event)"
              (mousedown)="handleMouseDown($event)"
              (mouseup)="handleMouseUp($event)"
              (mousemove)="handleMouseMove($event)"
              (mouseover)="handleMouseOver($event)"
              (mouseout)="handleMouseOut($event)"
              (mouseenter)="handleMouseEnter($event)"
              (mouseleave)="handleMouseLeave($event)" />
          }
        }
        
        <!-- Label -->
        @if (shouldShowLabel()) {
          <svg:text
            class="recharts-bar-label"
            [attr.x]="getLabelX(bar)"
            [attr.y]="getLabelY(bar)"
            [attr.text-anchor]="getLabelTextAnchor()"
            [attr.dominant-baseline]="getLabelBaseline()"
            [attr.fill]="getLabelFill()"
            [attr.font-size]="getLabelFontSize()">
            {{ getLabelText(bar) }}
          </svg:text>
        }
      }
    }
  `
})
export class BarComponent {
  private store = inject(Store);
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private tooltipService = inject(TooltipService, { optional: true });
  
  // Core recharts API inputs
  dataKey = input.required<string>();
  data = input<ChartData[]>([]);
  
  // Layout
  layout = input<'horizontal' | 'vertical'>('horizontal');
  
  // Axis IDs
  xAxisId = input<string | number>(0);
  yAxisId = input<string | number>(0);
  
  // Legend
  legendType = input<'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none'>('rect');
  
  // Label configuration
  label = input<boolean | Record<string, any> | any>(false);
  
  // Data array (recharts compatibility)
  dataArray = input<any[] | undefined>(undefined);
  
  // Bar sizing
  barSize = input<number | string | undefined>(undefined);
  maxBarSize = input<number | undefined>(undefined);
  minPointSize = input<number | Function>(0);
  
  // Background
  background = input<boolean | Record<string, any> | any>(false);
  
  // Shape customization
  shape = input<any | Function | undefined>(undefined);
  
  // Radius for rounded corners
  radius = input<number | [number, number, number, number] | undefined>(undefined);
  
  // Active bar configuration
  activeBar = input<boolean | Record<string, any> | any>(true);
  
  // Stacking
  stackId = input<string | number | undefined>(undefined);
  
  // Styling
  fill = input<string>('#8884d8');
  stroke = input<string>('none');
  strokeWidth = input<number>(0);
  
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
  
  // Unique ID
  id = input<string | undefined>(undefined);
  
  // Multi-series support (internal)
  barIndex = input<number>(0);
  barCount = input<number>(1);
  
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
  
  // Stacked data calculation
  stackedData = computed(() => {
    const data = this.data();
    const stackId = this.stackId();
    
    if (!stackId) {
      return data; // No stacking
    }
    
    // For stacking, we need to calculate cumulative values
    // This is a simplified version - in real recharts, this would be handled by the chart container
    return data.map((item, index) => {
      // For now, return original data as ChartData
      // In a full implementation, this would calculate stack offsets
      return item;
    });
  });
  
  // Computed properties
  bars = computed(() => {
    const data = this.stackedData();
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
      let barWidth = bandWidth / barCount;
      
      // Apply barSize constraints
      const barSizeValue = this.barSize();
      const maxBarSizeValue = this.maxBarSize();
      
      if (barSizeValue !== undefined) {
        if (typeof barSizeValue === 'string' && barSizeValue.endsWith('%')) {
          const percentage = parseFloat(barSizeValue) / 100;
          barWidth = bandWidth * percentage;
        } else if (typeof barSizeValue === 'number') {
          barWidth = Math.min(barSizeValue, barWidth);
        }
      }
      
      if (maxBarSizeValue !== undefined) {
        barWidth = Math.min(maxBarSizeValue, barWidth);
      }
      
      const x = bandX + (barIndex * barWidth);
      
      let y = yScale(value);
      let height = plotArea.height - y;
      
      // Apply minPointSize
      const minPointSizeValue = this.minPointSize();
      if (typeof minPointSizeValue === 'function') {
        const minSize = minPointSizeValue(value, item);
        if (height < minSize) {
          height = minSize;
          // Adjust y position to maintain bottom alignment
          y = plotArea.height - height;
        }
      } else if (typeof minPointSizeValue === 'number' && minPointSizeValue > 0) {
        if (height < minPointSizeValue) {
          height = minPointSizeValue;
          // Adjust y position to maintain bottom alignment
          y = plotArea.height - height;
        }
      }
      
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
  
  // Background configuration
  shouldShowBackground = computed(() => {
    const backgroundConfig = this.background();
    return backgroundConfig !== false;
  });
  
  backgroundProps = computed(() => {
    const backgroundConfig = this.background();
    if (typeof backgroundConfig === 'object' && backgroundConfig !== null) {
      return backgroundConfig;
    }
    return {};
  });
  
  // Active bar configuration
  shouldShowActiveBar = computed(() => {
    const activeBarConfig = this.activeBar();
    return activeBarConfig !== false;
  });
  
  activeBarProps = computed(() => {
    const activeBarConfig = this.activeBar();
    if (typeof activeBarConfig === 'object' && activeBarConfig !== null) {
      return activeBarConfig;
    }
    return {};
  });
  
  // Active bar index from tooltip service
  activeBarIndex = computed(() => {
    if (!this.tooltipService || !this.shouldShowActiveBar()) {
      return -1;
    }
    
    const isActive = this.tooltipService.active();
    if (!isActive) {
      return -1;
    }
    
    // For bar charts, find the bar under the tooltip
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
    
    const bars = this.bars();
    const barIndex = this.barIndex();
    const barCount = this.barCount();
    
    // Find which bar the mouse is over
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      if (plotX >= bar.x && plotX <= bar.x + bar.width) {
        return i;
      }
    }
    
    return -1;
  });
  
  // Label configuration
  shouldShowLabel = computed(() => {
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
  getLabelX(bar: BarRect): number {
    return bar.x + bar.width / 2;
  }
  
  getLabelY(bar: BarRect): number {
    const labelProps = this.labelProps();
    const position = labelProps.position || 'top';
    
    switch (position) {
      case 'top':
        return bar.y - 5;
      case 'middle':
        return bar.y + bar.height / 2;
      case 'bottom':
        return bar.y + bar.height + 15;
      default:
        return bar.y - 5;
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
  
  getLabelText(bar: BarRect): string {
    const labelProps = this.labelProps();
    const formatter = labelProps.formatter;
    
    if (formatter && typeof formatter === 'function') {
      return formatter(bar.value, bar.payload);
    }
    
    const unit = this.unit();
    return unit ? `${bar.value}${unit}` : String(bar.value);
  }
  
  getRadius(): number {
    const radiusValue = this.radius();
    if (typeof radiusValue === 'number') {
      return radiusValue;
    }
    if (Array.isArray(radiusValue)) {
      // For simplicity, use the first value for all corners
      return radiusValue[0] || 0;
    }
    return 0;
  }
  
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
  
  // Animation and styling methods
  getAnimationStyle(): string {
    return 'none';
  }
  
  animatedY(index: number, originalY: number): number {
    if (!this.isAnimationActive()) {
      return originalY;
    }
    
    const progress = this.animationProgress();
    const plotArea = this.plotArea();
    const originalHeight = plotArea.height - originalY;
    const animatedHeight = originalHeight * progress;
    
    return plotArea.height - animatedHeight;
  }
  
  animatedHeight(index: number, originalHeight: number): number {
    if (!this.isAnimationActive()) {
      return originalHeight;
    }
    
    const progress = this.animationProgress();
    return originalHeight * progress;
  }
  
  isActiveBar(index: number): boolean {
    return this.activeBarIndex() === index;
  }
  
  getBarFill(index: number): string {
    if (this.isActiveBar(index)) {
      const activeProps = this.activeBarProps();
      return activeProps.fill || this.fill();
    }
    return this.fill();
  }
  
  getBarStroke(index: number): string {
    if (this.isActiveBar(index)) {
      const activeProps = this.activeBarProps();
      return activeProps.stroke || this.stroke();
    }
    return this.stroke();
  }
  
  getBarStrokeWidth(index: number): number {
    if (this.isActiveBar(index)) {
      const activeProps = this.activeBarProps();
      return activeProps.strokeWidth || this.strokeWidth();
    }
    return this.strokeWidth();
  }
  
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
}