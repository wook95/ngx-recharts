
import {
  Component,
  input,
  computed,
  inject,
  ChangeDetectionStrategy,
  ContentChild,
  effect,
  AfterContentInit,
  Injector
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ChartContainerComponent } from '../container/chart-container.component';
import { RechartsWrapperComponent } from '../container/recharts-wrapper.component';
import { ChartData, ChartMargin } from '../core/types';
import { TooltipConfig } from '../core/tooltip-types';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipService } from '../services/tooltip.service';
import { CHART_LAYOUT, useChartLayout } from '../context/chart-layout.context';
import { CHART_DATA, useChartData } from '../context/chart-data.context';

@Component({
  selector: 'ngx-area-chart',
  standalone: true,
  imports: [CommonModule, ChartContainerComponent, RechartsWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TooltipService,
    { provide: CHART_LAYOUT, useFactory: useChartLayout },
    { provide: CHART_DATA, useFactory: useChartData }
  ],
  template: `
    <ngx-recharts-wrapper
      [width]="actualWidth()"
      [height]="actualHeight()">
      <ngx-chart-container
        [data]="data()"
        [width]="actualWidth()"
        [height]="actualHeight()"
        [margin]="margin()"
        [chartType]="'area'"
        [tooltip]="tooltip()">
        
        <ng-content></ng-content>
      </ngx-chart-container>
    </ngx-recharts-wrapper>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AreaChartComponent implements AfterContentInit {
  private store = inject(Store);
  private chartLayout = inject(CHART_LAYOUT);
  private chartDataContext = inject(CHART_DATA);
  private responsiveService = inject(ResponsiveContainerService, {
    optional: true,
  });
  private injector = inject(Injector);

  
  constructor() {
    // Chart initialization - no longer need to manage offsets
  }

  ngAfterContentInit() {
    // Sync data to context
    effect(() => {
      this.chartDataContext.setData(this.data());
    }, { injector: this.injector });
  }
  
  // Inputs
  data = input.required<ChartData[]>();
  width = input<number>(600);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 10, right: 5, bottom: 5, left: 5 });
  
  // Tooltip configuration
  tooltip = input<TooltipConfig>({});
  
  // Use responsive dimensions if available, otherwise fall back to props
  actualWidth = computed(() => {
    if (this.responsiveService) {
      const width = this.responsiveService.width();
      // Use ResponsiveContainer size if it's valid (> 10 to avoid tiny sizes)
      const result = width > 10 ? width : this.width();

      return result;
    }
    return this.width();
  });
  
  actualHeight = computed(() => {
    if (this.responsiveService) {
      const height = this.responsiveService.height();
      // Use ResponsiveContainer size if it's valid (> 10 to avoid tiny sizes)
      const result = height > 10 ? height : this.height();

      return result;
    }
    return this.height();
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