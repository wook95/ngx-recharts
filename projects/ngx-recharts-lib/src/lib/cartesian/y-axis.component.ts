import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { AxisOrientation, AxisType } from '../core/axis-types';
import { ChartData } from '../core/types';
import { CartesianAxisComponent } from './cartesian-axis.component';

@Component({
  selector: 'svg:g[ngx-y-axis]',
  standalone: true,
  imports: [CartesianAxisComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g ngx-cartesian-axis
      [x]="0"
      [y]="0"
      [width]="0"
      [height]="0"
      [orientation]="orientation()"
      [type]="type()"
      [dataKey]="dataKey()"
      [tick]="tick()"
      [tickCount]="tickCount()"
      [tickFormatter]="tickFormatter()"
      [label]="label()"
      [unit]="unit()"
      [hide]="hide()"
      [data]="data()"
      [tickMargin]="tickMargin()"
      [chartType]="chartType()"
      [axisLine]="axisLine()"
      [tickLine]="tickLine()"
      [tickSize]="tickSize()"
      [mirror]="mirror()"
      [interval]="interval()"
      [minTickGap]="minTickGap()"
    ></svg:g>
  `,
})
export class YAxisComponent {
  // Recharts YAxis API - delegate to CartesianAxis
  type = input<AxisType>('number');
  dataKey = input<string>();
  orientation = input<AxisOrientation>('left');
  tick = input<boolean>(true);
  tickCount = input<number>(5);
  tickFormatter = input<(value: any) => string>();
  label = input<string>();
  unit = input<string>();
  hide = input<boolean>(false);
  data = input<ChartData[]>([]);
  tickMargin = input<number>(2);
  chartType = input<'line' | 'area' | 'bar' | 'composed'>('bar');
  
  // CartesianAxis specific properties
  axisLine = input<boolean | object>(true);
  tickLine = input<boolean | object>(true);
  tickSize = input<number>(6);
  mirror = input<boolean>(false);
  interval = input<'preserveStart' | 'preserveEnd' | 'preserveStartEnd' | number>('preserveEnd');
  minTickGap = input<number>(5);
}