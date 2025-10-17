import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AxisOrientation, AxisType } from '../core/axis-types';
import { ChartData } from '../core/types';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { ScaleService } from '../services/scale.service';

@Component({
  selector: 'svg:g[ngx-x-axis]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g class="recharts-xAxis xAxis" [attr.transform]="axisTransform()">
      @if (!hide()) {
      <!-- Axis line -->
      <svg:line
        class="recharts-cartesian-axis-line"
        [attr.x1]="0"
        [attr.y1]="0"
        [attr.x2]="actualWidth()"
        [attr.y2]="0"
        stroke="#666"
        fill="none"
      />

      <!-- Ticks -->
      @for (tick of ticks(); track tick.value) {
      <svg:g
        class="recharts-cartesian-axis-tick"
        [attr.transform]="'translate(' + tick.coordinate + ',0)'"
      >
        @if (showTick()) {
        <svg:line
          class="recharts-cartesian-axis-tick-line"
          [attr.x1]="0"
          [attr.y1]="0"
          [attr.x2]="0"
          [attr.y2]="tickSize()"
          stroke="#666"
          fill="none"
        />
        }
        <svg:text
          class="recharts-cartesian-axis-tick-value"
          [attr.x]="0"
          [attr.y]="textY()"
          text-anchor="middle"
          [attr.dominant-baseline]="textBaseline()"
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
        [attr.x]="actualWidth() / 2"
        [attr.y]="labelY()"
        text-anchor="middle"
        fill="#666"
      >
        {{ label() }}
      </svg:text>
      } }
    </svg:g>
  `,
})
export class XAxisComponent {
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

        // Calculate axis height with increased label gap
        const tickSize = 6;
        const tickMargin = this.tickMargin();
        const textHeight = 14; // Estimated text height
        const labelGapWithTick = 20; // Increased gap for better spacing
        const labelHeight = hasLabel ? 14 : 0; // Label text height
        const padding = 8; // Extra padding for better spacing

        const axisHeight =
          tickSize +
          tickMargin +
          textHeight +
          (hasLabel ? labelGapWithTick + labelHeight : 0) +
          padding;

        if (orientation === 'top') {
          this.responsiveService.setAxisOffset({ top: axisHeight });
          this.responsiveService.setAxisInfo({ hasTopXAxisLabel: hasLabel });
        } else {
          this.responsiveService.setAxisOffset({ bottom: axisHeight });
          this.responsiveService.setAxisInfo({ hasBottomXAxisLabel: hasLabel });
        }
      }
    });
  }

  // Inputs
  type = input<AxisType>('category');
  dataKey = input<string>('name');
  orientation = input<AxisOrientation>('bottom');
  tick = input<boolean>(true);
  tickCount = input<number>(5);
  tickFormatter = input<(value: any) => string>();
  label = input<string>();
  unit = input<string>();
  hide = input<boolean>(false);
  data = input<ChartData[]>([]);
  tickMargin = input<number>(2); // Recharts default

  // Internal properties
  axisWidth = input<number>(400);
  axisHeight = input<number>(30);

  // Use plot area width from responsive service
  actualWidth = computed(() => {
    const plotWidth = this.responsiveService?.plotWidth() ?? 0;
    return plotWidth > 0 ? plotWidth : this.axisWidth();
  });

  // Computed properties
  showTick = computed(() => this.tick());
  tickSize = computed(() => (this.orientation() === 'top' ? -6 : 6));
  textY = computed(() => {
    const orientation = this.orientation();
    const tickSize = Math.abs(this.tickSize());
    const margin = this.tickMargin();
    // tickMargin is the distance from tick line end to text
    return orientation === 'top' ? -(tickSize + margin) : tickSize + margin;
  });
  
  textBaseline = computed(() => {
    return this.orientation() === 'top' ? 'text-after-edge' : 'hanging';
  });
  labelY = computed(() => {
    const orientation = this.orientation();
    // Increased gap between tick text and label for better readability
    const textHeight = 14;
    const labelGapWithTick = orientation === 'top' ? 5 : 20; // Increased from recharts 5 to 20
    const tickSize = Math.abs(this.tickSize());
    const tickMargin = this.tickMargin();

    if (orientation === 'top') {
      return -(tickSize + tickMargin + textHeight + labelGapWithTick);
    } else {
      return tickSize + tickMargin + textHeight + labelGapWithTick;
    }
  });

  // Axis transform based on orientation
  axisTransform = computed(() => {
    const orientation = this.orientation();
    const height = this.responsiveService?.plotHeight() ?? 300;

    if (orientation === 'top') {
      return 'translate(0, 0)';
    } else {
      return `translate(0, ${height})`;
    }
  });

  ticks = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const width = this.actualWidth();

    if (!data.length || width <= 0) return [];

    if (this.type() === 'category') {
      // Category scale for categorical data
      const domain = this.scaleService.getCategoryDomain(data, dataKey);
      const scale = this.scaleService.createBandScale(domain, [0, width]);
      return this.scaleService.generateBandTicks(scale);
    } else {
      // Linear scale for numerical data
      const domain = this.scaleService.getLinearDomain(data, dataKey);
      const scale = this.scaleService.createLinearScale(domain, [0, width]);
      return this.scaleService.generateLinearTicks(scale, this.tickCount());
    }
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
