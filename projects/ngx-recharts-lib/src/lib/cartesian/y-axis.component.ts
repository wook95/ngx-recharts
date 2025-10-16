import {
  Component,
  input,
  computed,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AxisProps, AxisOrientation, AxisType } from '../core/axis-types';
import { ScaleService } from '../services/scale.service';
import { ChartData } from '../core/types';

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
          [attr.y2]="axisHeight()"
          stroke="#666"
          fill="none" />
        
        <!-- Ticks -->
        @for (tick of ticks(); track tick.value) {
          <svg:g class="recharts-cartesian-axis-tick" [attr.transform]="'translate(0,' + tick.coordinate + ')'">
            @if (showTick()) {
              <svg:line
                class="recharts-cartesian-axis-tick-line"
                [attr.x1]="0"
                [attr.y1]="0"
                [attr.x2]="tickSize()"
                [attr.y2]="0"
                stroke="#666"
                fill="none" />
            }
            <svg:text
              class="recharts-cartesian-axis-tick-value"
              [attr.x]="textX()"
              [attr.y]="0"
              text-anchor="end"
              dominant-baseline="middle"
              fill="#666">
              {{ formatTick(tick.value) }}
            </svg:text>
          </svg:g>
        }
        
        <!-- Label -->
        @if (label()) {
          <svg:text
            class="recharts-label"
            [attr.x]="labelX()"
            [attr.y]="axisHeight() / 2"
            text-anchor="middle"
            dominant-baseline="middle"
            [attr.transform]="'rotate(-90, ' + labelX() + ', ' + (axisHeight() / 2) + ')'"
            fill="#666">
            {{ label() }}
          </svg:text>
        }
      }
    </svg:g>
  `
})
export class YAxisComponent {
  private store = inject(Store);
  private scaleService = inject(ScaleService);
  
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
  
  // Internal properties
  axisWidth = input<number>(60);
  axisHeight = input<number>(300);
  
  // Computed properties
  showTick = computed(() => this.tick());
  tickSize = computed(() => this.orientation() === 'right' ? 6 : -6);
  textX = computed(() => this.orientation() === 'right' ? 9 : -9);
  labelX = computed(() => this.orientation() === 'right' ? 25 : -25);
  
  axisTransform = computed(() => 'translate(0, 0)');
  
  ticks = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const height = this.axisHeight();
    
    if (!data.length) return [];
    
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