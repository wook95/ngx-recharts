import {
  Component,
  input,
  computed,
  inject,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  AfterContentInit
} from '@angular/core';
import { Store } from '@ngrx/store';
import { chartActions } from '../store/chart.state';
import { ChartContainerComponent } from '../container/chart-container.component';
import { XAxisComponent } from '../cartesian/x-axis.component';
import { YAxisComponent } from '../cartesian/y-axis.component';
import { BarComponent } from '../cartesian/bar.component';
import { CartesianGridComponent } from '../cartesian/cartesian-grid.component';
import { ChartData, ChartMargin } from '../core/types';

@Component({
  selector: 'ngx-bar-chart',
  standalone: true,
  imports: [
    ChartContainerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-chart-container
      [data]="data()"
      [width]="width()"
      [height]="height()"
      [margin]="margin()">
      
      <ng-content></ng-content>
    </ngx-chart-container>
  `
})
export class BarChartComponent implements AfterContentInit {
  private store = inject(Store);
  
  @ContentChildren(BarComponent) bars!: QueryList<BarComponent>;
  @ContentChildren(XAxisComponent) xAxes!: QueryList<XAxisComponent>;
  @ContentChildren(YAxisComponent) yAxes!: QueryList<YAxisComponent>;
  @ContentChildren(CartesianGridComponent) grids!: QueryList<CartesianGridComponent>;
  
  // Inputs
  data = input.required<ChartData[]>();
  dataKey = input<string>('value');
  width = input<number>(600);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 20, right: 30, bottom: 40, left: 60 });
  fill = input<string>('#8884d8');
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
  
  ngAfterContentInit() {
    // Configure child components with chart data and dimensions
    this.bars.forEach(bar => {
      // Pass chart data and dimensions to each bar
    });
  }
}