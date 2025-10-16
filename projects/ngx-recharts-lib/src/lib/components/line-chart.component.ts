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
import { ChartData, ChartMargin } from '../core/types';

@Component({
  selector: 'ngx-line-chart',
  standalone: true,
  imports: [ChartContainerComponent],
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
export class LineChartComponent {
  private store = inject(Store);
  
  // Inputs
  data = input.required<ChartData[]>();
  width = input<number>(400);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 5, right: 5, bottom: 5, left: 5 });
  
  constructor() {
    // Chart data will be handled via effects
  }
}