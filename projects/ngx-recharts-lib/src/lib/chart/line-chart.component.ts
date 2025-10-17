import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartContainerComponent } from '../container/chart-container.component';
import { RechartsWrapperComponent } from '../container/recharts-wrapper.component';
import { ChartData, ChartMargin } from '../core/types';
import { ChartLayoutService } from '../services/chart-layout.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

@Component({
  selector: 'ngx-line-chart',
  standalone: true,
  imports: [ChartContainerComponent, RechartsWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-recharts-wrapper [width]="actualWidth()" [height]="actualHeight()">
      <ngx-chart-container
        [data]="data()"
        [width]="actualWidth()"
        [height]="actualHeight()"
        [margin]="margin()"
      >
        <ng-content></ng-content>
      </ngx-chart-container>
    </ngx-recharts-wrapper>
  `,
})
export class LineChartComponent {
  private store = inject(Store);
  private chartLayoutService = inject(ChartLayoutService);
  private responsiveService = inject(ResponsiveContainerService, {
    optional: true,
  });

  constructor() {
    // Effect to update margin in responsive service
    effect(() => {
      if (this.responsiveService) {
        this.responsiveService.setMargin(this.margin());
      }
    });
  }

  // Inputs
  data = input.required<ChartData[]>();
  dataKey = input<string>('value');
  width = input<number>(600);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 20, right: 30, bottom: 40, left: 60 });
  stroke = input<string>('#8884d8');
  xAxisLabel = input<string>();
  yAxisLabel = input<string>();

  // Use responsive dimensions if available, otherwise fall back to props
  actualWidth = computed(() => {
    const responsiveWidth = this.responsiveService?.width() ?? 0;
    return responsiveWidth > 0 ? responsiveWidth : this.width();
  });

  actualHeight = computed(() => {
    const responsiveHeight = this.responsiveService?.height() ?? 0;
    return responsiveHeight > 0 ? responsiveHeight : this.height();
  });

  // Computed plot area dimensions
  plotWidth = computed(() => {
    const m = this.margin();
    return this.actualWidth() - m.left - m.right;
  });

  plotHeight = computed(() => {
    const m = this.margin();
    return this.actualHeight() - m.top - m.bottom;
  });
}
