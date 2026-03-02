import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { ChartContainerComponent } from '../container/chart-container.component';
import { RechartsWrapperComponent } from '../container/recharts-wrapper.component';
import { ChartMargin } from '../core/types';
import { TooltipConfig } from '../core/tooltip-types';
import { CHART_TOOLTIP_SERVICE } from '../core/chart-context.token';
import { ChartDataService } from '../services/chart-data.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipService } from '../services/tooltip.service';

@Component({
  selector: 'ngx-funnel-chart',
  standalone: true,
  imports: [ChartContainerComponent, RechartsWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ChartDataService,
    TooltipService,
    GraphicalItemRegistryService,
    ResponsiveContainerService,
    { provide: CHART_TOOLTIP_SERVICE, useExisting: TooltipService },
  ],
  template: `
    <ngx-recharts-wrapper [width]="actualWidth()" [height]="actualHeight()">
      <ngx-chart-container
        [data]="data()"
        [width]="actualWidth()"
        [height]="actualHeight()"
        [margin]="margin()"
        [chartType]="'funnel'"
        [tooltip]="tooltip()"
      >
        <ng-content></ng-content>
      </ngx-chart-container>
    </ngx-recharts-wrapper>
  `,
})
export class FunnelChartComponent {
  private responsiveService = inject(ResponsiveContainerService, {
    optional: true,
  });
  private chartDataService = inject(ChartDataService);

  constructor() {
    if (this.responsiveService) {
      this.responsiveService.resetOffsets();
    }

    effect(() => {
      if (this.responsiveService) {
        this.responsiveService.setMargin(this.margin());
      }
    });

    // Set dimensions so child components share consistent plotWidth/plotHeight
    effect(() => {
      if (this.responsiveService) {
        this.responsiveService.setDimensions(this.actualWidth(), this.actualHeight());
      }
    });

    this.chartDataService.setChartType('funnel');

    effect(() => {
      this.chartDataService.setData(this.data());
      this.chartDataService.setMargin(this.margin());
    });
  }

  // Inputs
  data = input<any[]>([]);
  width = input<number>(730);
  height = input<number>(250);
  margin = input<ChartMargin>({ top: 5, right: 5, bottom: 5, left: 5 });
  tooltip = input<TooltipConfig>({});

  actualWidth = computed(() => {
    const responsiveWidth = this.responsiveService?.width() ?? 0;
    return responsiveWidth > 0 ? responsiveWidth : this.width();
  });

  actualHeight = computed(() => {
    const responsiveHeight = this.responsiveService?.height() ?? 0;
    return responsiveHeight > 0 ? responsiveHeight : this.height();
  });
}
