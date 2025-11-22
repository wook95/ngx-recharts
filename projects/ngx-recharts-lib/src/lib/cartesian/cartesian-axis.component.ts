import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { AxisOrientation, AxisType } from '../core/axis-types';
import { ChartData } from '../core/types';
import { CHART_LAYOUT } from '../context/chart-layout.context';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { ScaleService } from '../services/scale.service';
import { LabelComponent } from '../component/label.component';

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'svg:g[ngx-cartesian-axis]',
  standalone: true,
  imports: [LabelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g class="recharts-cartesian-axis" [attr.transform]="axisTransform()">
      @if (!hide()) {
      <!-- Axis line -->
      @if (axisLine()) {
      <svg:line
        class="recharts-cartesian-axis-line"
        [attr.x1]="axisLineCoords().x1"
        [attr.y1]="axisLineCoords().y1"
        [attr.x2]="axisLineCoords().x2"
        [attr.y2]="axisLineCoords().y2"
        [attr.stroke]="axisLineStyle().stroke"
        [attr.stroke-width]="axisLineStyle().strokeWidth"
        fill="none"
      />
      }

      <!-- Ticks -->
      @for (tick of filteredTicks(); track tick.value) {
      <svg:g
        class="recharts-cartesian-axis-tick"
        [attr.transform]="getTickTransform(tick.coordinate)"
      >
        @if (tickLine()) {
        <svg:line
          class="recharts-cartesian-axis-tick-line"
          [attr.x1]="tickLineCoords().x1"
          [attr.y1]="tickLineCoords().y1"
          [attr.x2]="tickLineCoords().x2"
          [attr.y2]="tickLineCoords().y2"
          [attr.stroke]="tickLineStyle().stroke"
          [attr.stroke-width]="tickLineStyle().strokeWidth"
          fill="none"
        />
        } @if (showTick()) {
        <svg:text
          class="recharts-cartesian-axis-tick-value"
          [attr.x]="textPosition().x"
          [attr.y]="textPosition().y"
          [attr.text-anchor]="textAnchor()"
          [attr.dominant-baseline]="textBaseline()"
          [attr.fill]="textStyle().fill"
        >
          {{ formatTick(tick.value) }}
        </svg:text>
        }
      </svg:g>
      }

      <!-- Label using Label component -->
      @if (label()) {
      <ngx-label
        [viewBox]="labelViewBox()"
        [value]="label()"
        [position]="labelPosition2()"
        [angle]="labelAngle()"
        [fill]="labelStyle().fill"
      />
      } }
    </svg:g>
  `,
})
export class CartesianAxisComponent {
  private scaleService = inject(ScaleService);
  private chartLayout = inject(CHART_LAYOUT);
  private responsiveService = inject(ResponsiveContainerService, {
    optional: true,
  });

  // Recharts CartesianAxis API
  x = input<number>(0);
  y = input<number>(0);
  width = input<number>(0);
  height = input<number>(0);
  orientation = input<AxisOrientation>('bottom');
  viewBox = input<ViewBox>({ x: 0, y: 0, width: 0, height: 0 });
  axisLine = input<boolean | object>(true);
  tickLine = input<boolean | object>(true);
  minTickGap = input<number>(5);
  tickSize = input<number>(6);
  interval = input<
    'preserveStart' | 'preserveEnd' | 'preserveStartEnd' | number
  >('preserveEnd');
  tick = input<boolean | object>(true);
  label = input<string | number>();
  mirror = input<boolean>(false);
  tickMargin = input<number>(2);

  // Additional inputs for axis functionality
  type = input<AxisType>('category');
  dataKey = input<string>();
  tickCount = input<number>(5);
  tickFormatter = input<(value: any) => string>();
  unit = input<string>();
  hide = input<boolean>(false);
  data = input<ChartData[]>([]);
  chartType = input<'line' | 'area' | 'bar' | 'composed'>('bar');

  constructor() {
    // Update responsive service with axis dimensions
    effect(() => {
      if (this.responsiveService && !this.hide()) {
        this.updateAxisOffset();
      }
    });
  }

  // Computed dimensions
  actualWidth = computed(() => {
    const inputWidth = this.width();
    const plotWidth = this.chartLayout.plotWidth();
    return inputWidth > 0 ? inputWidth : plotWidth > 0 ? plotWidth : 400;
  });

  actualHeight = computed(() => {
    const inputHeight = this.height();
    const plotHeight = this.chartLayout.plotHeight();
    return inputHeight > 0 ? inputHeight : plotHeight > 0 ? plotHeight : 300;
  });

  // Axis transform
  axisTransform = computed(() => {
    const orientation = this.orientation();
    const x = this.x();
    const y = this.y();

    if (orientation === 'top') {
      return `translate(${x}, ${y})`;
    } else if (orientation === 'bottom') {
      const height = this.actualHeight();
      return `translate(${x}, ${y + height})`;
    } else if (orientation === 'left') {
      return `translate(${x}, ${y})`;
    } else {
      // right
      const width = this.actualWidth();
      return `translate(${x + width}, ${y})`;
    }
  });

  // Ticks computation
  ticks = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const orientation = this.orientation();
    const chartType = this.chartType();
    const isHorizontal = orientation === 'top' || orientation === 'bottom';
    const size = isHorizontal ? this.actualWidth() : this.actualHeight();

    if (!data.length || size <= 0) return [];

    if (this.type() === 'category') {
      // Category type requires dataKey
      if (!dataKey) {
        console.warn('Category axis requires dataKey');
        return [];
      }
      
      if (chartType === 'line' || chartType === 'area') {
        // Linear scale for continuous data
        const scale = this.scaleService.createLinearScale(
          [0, data.length - 1],
          [0, size]
        );
        return data.map((item, index) => ({
          value: String(item[dataKey] || ''),
          coordinate: scale(index),
        }));
      } else {
        // Band scale for discrete data
        const domain = this.scaleService.getCategoryDomain(data, dataKey);
        const scale = this.scaleService.createBandScale(domain, [0, size]);
        return this.scaleService.generateBandTicks(scale);
      }
    } else {
      // Linear scale for numerical data
      let domain: [number, number];
      
      if (dataKey) {
        domain = this.scaleService.getLinearDomain(data, dataKey);
      } else {
        // For charts without dataKey, use all numeric values
        domain = this.scaleService.getAutoDomain(data);
      }
      // Y-axis should be flipped (high values at top, low at bottom)
      const range: [number, number] = isHorizontal ? [0, size] : [size, 0];
      const scale = this.scaleService.createLinearScale(domain, range);
      return this.scaleService.generateLinearTicks(scale, this.tickCount());
    }
  });

  // Filtered ticks based on interval
  filteredTicks = computed(() => {
    const allTicks = this.ticks();
    const interval = this.interval();

    if (typeof interval === 'number') {
      return allTicks.filter((_, index) => index % (interval + 1) === 0);
    }

    // For preserveStart/End logic, return all ticks for now
    return allTicks;
  });

  // Show tick text
  showTick = computed(() => {
    const tickInput = this.tick();
    return tickInput !== false;
  });

  // Style computations
  axisLineStyle = computed(() => {
    const axisLineInput = this.axisLine();
    const baseStyle = { stroke: '#666', strokeWidth: 1 };
    return typeof axisLineInput === 'object' && axisLineInput !== null
      ? { ...baseStyle, ...axisLineInput }
      : baseStyle;
  });

  tickLineStyle = computed(() => {
    const tickLineInput = this.tickLine();
    const baseStyle = { stroke: '#666', strokeWidth: 1 };
    return typeof tickLineInput === 'object' && tickLineInput !== null
      ? { ...baseStyle, ...tickLineInput }
      : baseStyle;
  });

  textStyle = computed(() => ({
    fill: '#666',
    fontSize: '12px',
  }));

  labelStyle = computed(() => ({
    fill: '#666'
  }));

  // Position computations
  axisLineCoords = computed(() => {
    const orientation = this.orientation();
    const width = this.actualWidth();
    const height = this.actualHeight();

    if (orientation === 'top' || orientation === 'bottom') {
      return { x1: 0, y1: 0, x2: width, y2: 0 };
    } else {
      return { x1: 0, y1: 0, x2: 0, y2: height };
    }
  });

  tickLineCoords = computed(() => {
    const orientation = this.orientation();
    const tickSize = this.tickSize();
    const mirror = this.mirror();
    const multiplier = mirror ? -1 : 1;

    if (orientation === 'top') {
      return { x1: 0, y1: 0, x2: 0, y2: -tickSize * multiplier };
    } else if (orientation === 'bottom') {
      return { x1: 0, y1: 0, x2: 0, y2: tickSize * multiplier };
    } else if (orientation === 'left') {
      return { x1: 0, y1: 0, x2: -tickSize * multiplier, y2: 0 };
    } else {
      // right
      return { x1: 0, y1: 0, x2: tickSize * multiplier, y2: 0 };
    }
  });

  textPosition = computed(() => {
    const orientation = this.orientation();
    const tickSize = this.tickSize();
    const tickMargin = this.tickMargin();
    const mirror = this.mirror();
    const multiplier = mirror ? -1 : 1;

    if (orientation === 'top') {
      return { x: 0, y: -(tickSize + tickMargin) * multiplier };
    } else if (orientation === 'bottom') {
      return { x: 0, y: (tickSize + tickMargin) * multiplier };
    } else if (orientation === 'left') {
      return { x: -(tickSize + tickMargin) * multiplier, y: 0 };
    } else {
      // right
      return { x: (tickSize + tickMargin) * multiplier, y: 0 };
    }
  });

  textAnchor = computed(() => {
    const orientation = this.orientation();
    if (orientation === 'left') return 'end';
    if (orientation === 'right') return 'start';
    return 'middle';
  });

  textBaseline = computed(() => {
    const orientation = this.orientation();
    if (orientation === 'top') return 'text-after-edge';
    if (orientation === 'bottom') return 'hanging';
    return 'central';
  });

  // Label viewBox for Label component
  labelViewBox = computed(() => {
    const width = this.actualWidth();
    const height = this.actualHeight();
    return {
      x: 0,
      y: 0,
      width,
      height
    };
  });

  // Label position using Label component's position system
  labelPosition2 = computed(() => {
    const orientation = this.orientation();
    if (orientation === 'top') return 'top';
    if (orientation === 'bottom') return 'bottom';
    if (orientation === 'left') return 'left';
    return 'right';
  });

  // Label angle for Y-axis rotation
  labelAngle = computed(() => {
    const orientation = this.orientation();
    return (orientation === 'left' || orientation === 'right') ? -90 : undefined;
  });

  getTickTransform(coordinate: number): string {
    const orientation = this.orientation();
    if (orientation === 'top' || orientation === 'bottom') {
      return `translate(${coordinate}, 0)`;
    } else {
      return `translate(0, ${coordinate})`;
    }
  }

  formatTick(value: any): string {
    const formatter = this.tickFormatter();
    if (formatter) {
      return formatter(value);
    }
    const unitStr = this.unit();
    return unitStr ? `${value}${unitStr}` : String(value);
  }

  private updateAxisOffset(): void {
    const orientation = this.orientation();
    const hasLabel = !!this.label();
    const tickSize = this.tickSize();
    const tickMargin = this.tickMargin();
    
    if (orientation === 'top' || orientation === 'bottom') {
      // X-axis calculations with increased spacing for legend compatibility
      const textHeight = 14;
      const labelGapWithTick = hasLabel ? 20 : 0; // Increased gap for better spacing
      const labelHeight = hasLabel ? 14 : 0;
      const padding = 8;
      
      const axisHeight = tickSize + tickMargin + textHeight + labelGapWithTick + labelHeight + padding;
      
      if (orientation === 'top') {
        this.responsiveService?.setAxisOffset({ top: axisHeight });
        this.responsiveService?.setAxisInfo({ hasTopXAxisLabel: hasLabel });
      } else {
        this.responsiveService?.setAxisOffset({ bottom: axisHeight });
        this.responsiveService?.setAxisInfo({ hasBottomXAxisLabel: hasLabel });
      }
    } else {
      // Y-axis calculations
      const textWidth = 40;
      const labelGapWithTick = hasLabel ? 20 : 0;
      const labelWidth = hasLabel ? 14 : 0;
      const padding = 10;
      
      const axisWidth = tickSize + tickMargin + textWidth + labelGapWithTick + labelWidth + padding;
      
      if (orientation === 'left') {
        this.responsiveService?.setAxisOffset({ left: axisWidth });
      } else {
        // Right Y-axis needs extra left padding to prevent X-axis label clipping
        this.responsiveService?.setAxisOffset({ right: axisWidth, left: 20 });
      }
    }
  }
}
