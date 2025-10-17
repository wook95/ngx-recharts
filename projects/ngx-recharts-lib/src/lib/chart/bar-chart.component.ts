import {
  Component,
  input,
  computed,
  inject,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  AfterContentInit,
  effect
} from '@angular/core';
import { Store } from '@ngrx/store';
import { chartActions } from '../store/chart.state';
import { ChartContainerComponent } from '../container/chart-container.component';
import { RechartsWrapperComponent } from '../container/recharts-wrapper.component';
import { XAxisComponent } from '../cartesian/x-axis.component';
import { YAxisComponent } from '../cartesian/y-axis.component';
import { BarComponent } from '../cartesian/bar.component';
import { CartesianGridComponent } from '../cartesian/cartesian-grid.component';
import { ChartData, ChartMargin } from '../core/types';
import { TooltipConfig } from '../core/tooltip-types';
import { ChartLayoutService } from '../services/chart-layout.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

@Component({
  selector: 'ngx-bar-chart',
  standalone: true,
  imports: [
    ChartContainerComponent,
    RechartsWrapperComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-recharts-wrapper
      [width]="actualWidth()"
      [height]="actualHeight()">
      <ngx-chart-container
        [data]="data()"
        [width]="actualWidth()"
        [height]="actualHeight()"
        [margin]="margin()"
        [chartType]="'bar'"
        [tooltip]="tooltip()">
        
        <ng-content></ng-content>
      </ngx-chart-container>
    </ngx-recharts-wrapper>
  `
})
export class BarChartComponent implements AfterContentInit {
  private store = inject(Store);
  private chartLayoutService = inject(ChartLayoutService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  
  constructor() {
    // Reset offsets when chart initializes
    if (this.responsiveService) {
      this.responsiveService.resetOffsets();
    }
    
    // Effect to update margin in responsive service
    effect(() => {
      if (this.responsiveService) {
        this.responsiveService.setMargin(this.margin());
      }
    });
  }
  
  @ContentChildren(BarComponent) bars!: QueryList<BarComponent>;
  @ContentChildren(XAxisComponent) xAxes!: QueryList<XAxisComponent>;
  @ContentChildren(YAxisComponent) yAxes!: QueryList<YAxisComponent>;
  @ContentChildren(CartesianGridComponent) grids!: QueryList<CartesianGridComponent>;
  
  // Inputs
  data = input.required<ChartData[]>();
  dataKey = input<string>('value');
  width = input<number>(600);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 10, right: 5, bottom: 5, left: 5 });
  fill = input<string>('#8884d8');
  xAxisLabel = input<string>();
  yAxisLabel = input<string>();
  
  // Tooltip configuration
  tooltip = input<TooltipConfig>({});
  
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
  
  ngAfterContentInit() {
    // Configure child components with chart data and dimensions
    this.bars.forEach(bar => {
      // Pass chart data and dimensions to each bar
    });
  }
}