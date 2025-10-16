import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { CartesianGridComponent } from '../cartesian/cartesian-grid.component';
import { LineComponent } from '../cartesian/line.component';
import { XAxisComponent } from '../cartesian/x-axis.component';
import { YAxisComponent } from '../cartesian/y-axis.component';
import { ChartContainerComponent } from '../container/chart-container.component';
import { ChartData, ChartMargin } from '../core/types';

@Component({
  selector: 'ngx-line-chart',
  standalone: true,
  imports: [
    ChartContainerComponent,
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
  `,
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
