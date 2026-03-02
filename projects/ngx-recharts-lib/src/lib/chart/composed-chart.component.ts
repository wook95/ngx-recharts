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
import { ChartData, ChartMargin } from '../core/types';
import { TooltipConfig } from '../core/tooltip-types';
import { ChartLayoutService } from '../services/chart-layout.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { CHART_TOOLTIP_SERVICE } from '../core/chart-context.token';
import { TooltipService } from '../services/tooltip.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { ChartDataService, YDomainMode } from '../services/chart-data.service';
import { CartesianLabelContextService } from '../context/label-context.service';
import { CartesianLabelListContextService } from '../context/label-list-context.service';

@Component({
  selector: 'ngx-composed-chart',
  standalone: true,
  imports: [ChartContainerComponent, RechartsWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ChartLayoutService, // deprecated: retained for LabelComponent/SurfaceComponent backward compat
    TooltipService,
    GraphicalItemRegistryService,
    ChartDataService,
    CartesianLabelContextService,
    CartesianLabelListContextService,
    {
      provide: CHART_TOOLTIP_SERVICE,
      useExisting: TooltipService,
    },
  ],
  template: `
    <ngx-recharts-wrapper [width]="actualWidth()" [height]="actualHeight()">
      <ngx-chart-container
        [data]="data()"
        [width]="actualWidth()"
        [height]="actualHeight()"
        [margin]="margin()"
        [chartType]="'composed'"
        [tooltip]="tooltip()"
      >
        <ng-content></ng-content>
      </ngx-chart-container>
    </ngx-recharts-wrapper>
  `,
})
export class ComposedChartComponent {
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

    this.chartDataService.setChartType('composed');

    effect(() => {
      this.chartDataService.setData(this.data());
      this.chartDataService.setMargin(this.margin());
      this.chartDataService.setYDomainMode(this.yDomainMode());
    });
  }

  data = input.required<ChartData[]>();
  yDomainMode = input<YDomainMode>('unified');
  width = input<number>(600);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 10, right: 5, bottom: 5, left: 5 });
  tooltip = input<TooltipConfig>({});

  actualWidth = computed(() => {
    const responsiveWidth = this.responsiveService?.width() ?? 0;
    return responsiveWidth > 0 ? responsiveWidth : this.width();
  });

  actualHeight = computed(() => {
    const responsiveHeight = this.responsiveService?.height() ?? 0;
    return responsiveHeight > 0 ? responsiveHeight : this.height();
  });

  plotWidth = computed(() => {
    const m = this.margin();
    return this.actualWidth() - m.left - m.right;
  });

  plotHeight = computed(() => {
    const m = this.margin();
    return this.actualHeight() - m.top - m.bottom;
  });
}
