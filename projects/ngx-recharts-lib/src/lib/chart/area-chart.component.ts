import {
  Component,
  input,
  computed,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartContainerComponent } from '../container/chart-container.component';
import { RechartsWrapperComponent } from '../container/recharts-wrapper.component';
import { ChartData, ChartMargin } from '../core/types';

@Component({
  selector: 'ngx-area-chart',
  standalone: true,
  imports: [
    ChartContainerComponent,
    RechartsWrapperComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-recharts-wrapper
      [width]="width()"
      [height]="height()">
      <ngx-chart-container
        [data]="data()"
        [width]="width()"
        [height]="height()"
        [margin]="margin()">
        
        <ng-content></ng-content>
      </ngx-chart-container>
    </ngx-recharts-wrapper>
  `
})
export class AreaChartComponent {
  private store = inject(Store);
  
  // Inputs
  data = input.required<ChartData[]>();
  width = input<number>(600);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 20, right: 30, bottom: 40, left: 60 });
  
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