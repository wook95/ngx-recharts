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
          [attr.x2]="axisWidth()"
          [attr.y2]="0"
          stroke="#666"
          fill="none" />
        
        <!-- Ticks -->
        @for (tick of ticks(); track tick.value) {
          <svg:g class="recharts-cartesian-axis-tick" [attr.transform]="'translate(' + tick.coordinate + ',0)'">
            @if (showTick()) {
              <svg:line
                class="recharts-cartesian-axis-tick-line"
                [attr.x1]="0"
                [attr.y1]="0"
                [attr.x2]="0"
                [attr.y2]="tickSize()"
                stroke="#666"
                fill="none" />
            }
            <svg:text
              class="recharts-cartesian-axis-tick-value"
              [attr.x]="0"
              [attr.y]="textY()"
              text-anchor="middle"
              dominant-baseline="hanging"
              fill="#666">
              {{ formatTick(tick.value) }}
            </svg:text>
          </svg:g>
        }
        
        <!-- Label -->
        @if (label()) {
          <svg:text
            class="recharts-label"
            [attr.x]="axisWidth() / 2"
            [attr.y]="labelY()"
            text-anchor="middle"
            fill="#666">
            {{ label() }}
          </svg:text>
        }
      }
    </svg:g>
  `
})
export class XAxisComponent {
  private store = inject(Store);
  private scaleService = inject(ScaleService);
  
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
  
  // Internal properties
  axisWidth = input<number>(400);
  axisHeight = input<number>(30);
  
  // Computed properties
  showTick = computed(() => this.tick());
  tickSize = computed(() => this.orientation() === 'top' ? -6 : 6);
  textY = computed(() => this.orientation() === 'top' ? -9 : 15);
  labelY = computed(() => this.orientation() === 'top' ? -25 : 35);
  
  axisTransform = computed(() => 'translate(0, 0)');
  
  ticks = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const width = this.axisWidth();
    
    if (!data.length) return [];
    
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