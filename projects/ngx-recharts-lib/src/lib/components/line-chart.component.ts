import {
  Component,
  input,
  computed,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { chartActions } from '../store/chart.state';
import { ChartContainerComponent } from './chart-container.component';
import { XAxisComponent } from './x-axis.component';
import { YAxisComponent } from './y-axis.component';
import { LineComponent } from './line.component';
import { CartesianGridComponent } from './cartesian-grid.component';
import { ChartData, ChartMargin } from '../core/types';

@Component({
  selector: 'ngx-line-chart',
  standalone: true,
  imports: [
    ChartContainerComponent,
    XAxisComponent,
    YAxisComponent,
    LineComponent,
    CartesianGridComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-chart-container
      [data]="data()"
      [width]="width()"
      [height]="height()"
      [margin]="margin()">
      
      <!-- Grid -->
      <svg:g ngx-cartesian-grid
        [width]="plotWidth()"
        [height]="plotHeight()"></svg:g>
      
      <!-- Line -->
      <svg:g ngx-line
        [dataKey]="dataKey()"
        [data]="data()"
        [chartWidth]="plotWidth()"
        [chartHeight]="plotHeight()"
        [margin]="{top: 0, right: 0, bottom: 0, left: 0}"
        [stroke]="stroke()"></svg:g>
      
      <!-- X Axis -->
      <svg:g [attr.transform]="'translate(0,' + plotHeight() + ')'">
        <svg:g ngx-x-axis
          [axisWidth]="plotWidth()"
          [data]="data()"
          [dataKey]="'name'"
          [label]="xAxisLabel()"></svg:g>
      </svg:g>
        
      <!-- Y Axis -->
      <svg:g ngx-y-axis
        [axisHeight]="plotHeight()"
        [data]="data()"
        [dataKey]="dataKey()"
        [label]="yAxisLabel()"></svg:g>
      
      <ng-content></ng-content>
    </ngx-chart-container>
  `
})
export class LineChartComponent {
  private store = inject(Store);
  
  // Inputs
  data = input.required<ChartData[]>();
  dataKey = input<string>('value');
  width = input<number>(600);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 20, right: 30, bottom: 40, left: 60 });
  stroke = input<string>('#8884d8');
  xAxisLabel = input<string>();
  yAxisLabel = input<string>();
  
  // Computed plot area dimensions
  plotWidth = computed(() => {
    const m = this.margin();
    return this.width() - m.left - m.right;
  });
  
  plotHeight = computed(() => {
    const m = this.margin();
    return this.height() - m.top - m.bottom;
  });
}