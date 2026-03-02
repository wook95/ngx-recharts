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
import { TooltipService } from '../services/tooltip.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { ChartDataService } from '../services/chart-data.service';
import { PolarCoordinateService } from '../services/polar-coordinate.service';
import { TOOLTIP_HIT_TEST_STRATEGY } from '../services/tooltip-hit-test-strategy';
import { PolarTooltipStrategy } from '../services/polar-tooltip-strategy';
import { CHART_TOOLTIP_SERVICE } from '../core/chart-context.token';
import { PolarLabelContextService } from '../context/label-context.service';
import { PolarLabelListContextService } from '../context/label-list-context.service';

@Component({
  selector: 'ngx-radial-bar-chart',
  standalone: true,
  imports: [ChartContainerComponent, RechartsWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ChartDataService,
    TooltipService,
    GraphicalItemRegistryService,
    ResponsiveContainerService,
    PolarCoordinateService,
    // deprecated: retained for LabelComponent/SurfaceComponent backward compat
    ChartLayoutService,
    PolarLabelContextService,
    PolarLabelListContextService,
    { provide: TOOLTIP_HIT_TEST_STRATEGY, useClass: PolarTooltipStrategy },
    { provide: CHART_TOOLTIP_SERVICE, useExisting: TooltipService },
  ],
  template: `
    <ngx-recharts-wrapper [width]="actualWidth()" [height]="actualHeight()">
      <ngx-chart-container
        [data]="data()"
        [chartType]="'radialBar'"
        [margin]="margin()"
        [width]="actualWidth()"
        [height]="actualHeight()"
        [tooltip]="tooltip()"
      >
        <ng-content></ng-content>
      </ngx-chart-container>
    </ngx-recharts-wrapper>
  `,
})
export class RadialBarChartComponent {
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private chartDataService = inject(ChartDataService);
  private polarService = inject(PolarCoordinateService);

  // Inputs
  data = input<any[]>([]);
  width = input<number>(400);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 0, right: 0, bottom: 0, left: 0 });
  tooltip = input<TooltipConfig>({});
  cx = input<number | string>('50%');
  cy = input<number | string>('50%');
  innerRadius = input<number | string>('30%');
  outerRadius = input<number | string>('90%');
  startAngle = input<number>(0);
  endAngle = input<number>(360);
  barSize = input<number | undefined>(undefined);
  barGap = input<number>(4);
  barCategoryGap = input<string>('10%');

  // Use responsive dimensions if available, otherwise fall back to props
  actualWidth = computed(() => {
    const responsiveWidth = this.responsiveService?.width() ?? 0;
    return responsiveWidth > 0 ? responsiveWidth : this.width();
  });

  actualHeight = computed(() => {
    const responsiveHeight = this.responsiveService?.height() ?? 0;
    return responsiveHeight > 0 ? responsiveHeight : this.height();
  });

  // Resolved numeric values for polar coordinates
  private resolvedCx = computed(() => this.resolvePercent(this.cx(), this.actualWidth()));
  private resolvedCy = computed(() => this.resolvePercent(this.cy(), this.actualHeight()));
  private resolvedInnerRadius = computed(() =>
    this.resolvePercent(this.innerRadius(), Math.min(this.actualWidth(), this.actualHeight()) / 2)
  );
  private resolvedOuterRadius = computed(() =>
    this.resolvePercent(this.outerRadius(), Math.min(this.actualWidth(), this.actualHeight()) / 2)
  );

  constructor() {
    if (this.responsiveService) {
      this.responsiveService.resetOffsets();
    }

    effect(() => {
      if (this.responsiveService) {
        this.responsiveService.setMargin(this.margin());
      }
    });

    // yDomainMode not applicable for scatter/radialBar charts
    this.chartDataService.setChartType('radialBar');

    effect(() => {
      this.chartDataService.setData(this.data());
      this.chartDataService.setMargin(this.margin());
    });

    effect(() => {
      this.polarService.update({
        cx: this.resolvedCx(),
        cy: this.resolvedCy(),
        innerRadius: this.resolvedInnerRadius(),
        outerRadius: this.resolvedOuterRadius(),
        startAngle: this.startAngle(),
        endAngle: this.endAngle(),
      });
    });
  }

  private resolvePercent(value: number | string, total: number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.endsWith('%')) {
      return (parseFloat(value) / 100) * total;
    }
    return parseFloat(value as string) || 0;
  }
}
