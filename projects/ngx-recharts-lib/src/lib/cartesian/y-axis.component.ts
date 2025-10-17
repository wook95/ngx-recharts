import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  effect,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AxisOrientation, AxisType } from '../core/axis-types';
import { ChartData } from '../core/types';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { ScaleService } from '../services/scale.service';

@Component({
  selector: 'svg:g[ngx-y-axis]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g class="recharts-yAxis yAxis" [attr.transform]="axisTransform()">
      @if (!hide()) {
      <!-- Axis line -->
      <svg:line
        class="recharts-cartesian-axis-line"
        [attr.x1]="0"
        [attr.y1]="0"
        [attr.x2]="0"
        [attr.y2]="actualHeight()"
        stroke="#666"
        fill="none"
      />

      <!-- Ticks -->
      @for (tick of ticks(); track tick.value) {
      <svg:g
        class="recharts-cartesian-axis-tick"
        [attr.transform]="'translate(0,' + tick.coordinate + ')'"
      >
        @if (showTick()) {
        <svg:line
          class="recharts-cartesian-axis-tick-line"
          [attr.x1]="0"
          [attr.y1]="0"
          [attr.x2]="tickSize()"
          [attr.y2]="0"
          stroke="#666"
          fill="none"
        />
        }
        <svg:text
          class="recharts-cartesian-axis-tick-value"
          [attr.x]="textX()"
          [attr.y]="0"
          [attr.text-anchor]="textAnchor()"
          dominant-baseline="middle"
          fill="#666"
        >
          {{ formatTick(tick.value) }}
        </svg:text>
      </svg:g>
      }

      <!-- Label -->
      @if (label()) {
      <svg:text
        class="recharts-label"
        [attr.x]="labelX()"
        [attr.y]="actualHeight() / 2"
        text-anchor="middle"
        dominant-baseline="middle"
        [attr.transform]="
          'rotate(-90, ' + labelX() + ', ' + actualHeight() / 2 + ')'
        "
        fill="#666"
      >
        {{ label() }}
      </svg:text>
      } }
    </svg:g>
  `,
})
export class YAxisComponent {
  private store = inject(Store);
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, {
    optional: true,
  });
  
  constructor() {
    // Update axis offset when orientation or label changes
    effect(() => {
      if (this.responsiveService && !this.hide()) {
        const orientation = this.orientation();
        const hasLabel = !!this.label();
        
        // Calculate axis width: tick size + tick margin + text width + label space
        const tickSize = 6;
        const tickMargin = this.tickMargin();
        const textWidth = 40; // Approximate width for tick text
        const labelWidth = hasLabel ? 20 : 0;
        const padding = 5;
        
        const axisWidth = tickSize + tickMargin + textWidth + labelWidth + padding;
        
        if (orientation === 'right') {
          this.responsiveService.setAxisOffset({ right: axisWidth });
        } else {
          this.responsiveService.setAxisOffset({ left: axisWidth });
        }
      }
    });
  }

  // Inputs
  type = input<AxisType>('number');
  dataKey = input<string>('uv');
  orientation = input<AxisOrientation>('left');
  tick = input<boolean>(true);
  tickCount = input<number>(5);
  tickFormatter = input<(value: any) => string>();
  label = input<string>();
  unit = input<string>();
  hide = input<boolean>(false);
  data = input<ChartData[]>([]);
  tickMargin = input<number>(8); // Increased from recharts default of 2

  // Internal properties
  axisWidth = input<number>(60);
  axisHeight = input<number>(300);

  // Use plot area height from responsive service
  actualHeight = computed(() => {
    const plotHeight = this.responsiveService?.plotHeight() ?? 0;
    return plotHeight > 0 ? plotHeight : this.axisHeight();
  });

  // Computed properties
  showTick = computed(() => this.tick());
  tickSize = computed(() => (this.orientation() === 'right' ? 6 : -6));
  textX = computed(() => {
    const orientation = this.orientation();
    const tickSize = Math.abs(this.tickSize());
    const margin = this.tickMargin();
    // tickMargin is the distance from tick line end to text
    return orientation === 'right' ? (tickSize + margin) : -(tickSize + margin);
  });
  textAnchor = computed(() =>
    this.orientation() === 'right' ? 'start' : 'end'
  );
  labelX = computed(() => {
    const orientation = this.orientation();
    // Label should be positioned further away from tick text
    // Estimate text width for longest tick + extra margin
    const textWidth = 40; // Approximate width for tick text
    const labelMargin = 15;
    const tickSize = Math.abs(this.tickSize());
    const tickMargin = this.tickMargin();
    
    if (orientation === 'right') {
      return tickSize + tickMargin + textWidth + labelMargin;
    } else {
      return -(tickSize + tickMargin + textWidth + labelMargin);
    }
  });

  // Axis transform based on orientation
  axisTransform = computed(() => {
    const orientation = this.orientation();
    const width = this.responsiveService?.plotWidth() ?? 400;

    if (orientation === 'right') {
      return `translate(${width}, 0)`;
    } else {
      return 'translate(0, 0)';
    }
  });

  ticks = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const height = this.actualHeight();

    if (!data.length || height <= 0) return [];

    // Y-axis is typically numerical
    const domain = this.scaleService.getLinearDomain(data, dataKey);
    const scale = this.scaleService.createLinearScale(domain, [height, 0]); // Flip Y axis
    return this.scaleService.generateLinearTicks(scale, this.tickCount());
  });

  formatTick(value: any): string {
    const formatter = this.tickFormatter();
    if (formatter) {
      return formatter(value);
    }
    const unitStr = this.unit();
    return unitStr ? `${value}${unitStr}` : String(value);
  }
}
