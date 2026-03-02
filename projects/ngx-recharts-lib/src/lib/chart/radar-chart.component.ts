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
import { ChartDataService } from '../services/chart-data.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { PolarCoordinateService } from '../services/polar-coordinate.service';
import { PolarTooltipStrategy } from '../services/polar-tooltip-strategy';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipService } from '../services/tooltip.service';
import { TOOLTIP_HIT_TEST_STRATEGY } from '../services/tooltip-hit-test-strategy';
import { PolarLabelContextService } from '../context/label-context.service';
import { PolarLabelListContextService } from '../context/label-list-context.service';

@Component({
  selector: 'ngx-radar-chart',
  standalone: true,
  imports: [RechartsWrapperComponent, ChartContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ChartDataService,
    TooltipService,
    GraphicalItemRegistryService,
    ResponsiveContainerService,
    PolarCoordinateService,
    PolarLabelContextService,
    PolarLabelListContextService,
    { provide: TOOLTIP_HIT_TEST_STRATEGY, useClass: PolarTooltipStrategy },
  ],
  template: `
    <ngx-recharts-wrapper [width]="width()" [height]="height()">
      <ngx-chart-container
        [data]="data()"
        [chartType]="'radar'"
        [margin]="margin()"
        [width]="width()"
        [height]="height()">
        <ng-content />
      </ngx-chart-container>
    </ngx-recharts-wrapper>
  `,
})
export class RadarChartComponent {
  private chartDataService = inject(ChartDataService);
  private polarService = inject(PolarCoordinateService);

  // Inputs
  data = input<any[]>([]);
  width = input<number>(400);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 0, right: 0, bottom: 0, left: 0 });
  cx = input<number | string>('50%');
  cy = input<number | string>('50%');
  innerRadius = input<number>(0);
  outerRadius = input<number | string>('80%');
  startAngle = input<number>(90);
  endAngle = input<number>(450);

  // Computed resolved cx/cy in pixels
  resolvedCx = computed(() => {
    const val = this.cx();
    if (typeof val === 'string' && val.endsWith('%')) {
      return this.width() * (parseFloat(val) / 100);
    }
    return typeof val === 'number' ? val : parseFloat(val);
  });

  resolvedCy = computed(() => {
    const val = this.cy();
    if (typeof val === 'string' && val.endsWith('%')) {
      return this.height() * (parseFloat(val) / 100);
    }
    return typeof val === 'number' ? val : parseFloat(val);
  });

  // Computed resolved outerRadius
  resolvedOuterRadius = computed(() => {
    const r = this.outerRadius();
    if (typeof r === 'string' && r.endsWith('%')) {
      return Math.min(this.width(), this.height()) * (parseFloat(r) / 100);
    }
    const numR = typeof r === 'number' ? r : parseFloat(r);
    if (numR < 1) {
      return numR * Math.min(this.width(), this.height()) / 2;
    }
    return numR;
  });

  constructor() {
    this.chartDataService.setChartType('radar' as any);

    effect(() => {
      this.chartDataService.setData(this.data());
      this.chartDataService.setMargin(this.margin());
    });

    effect(() => {
      this.polarService.update({
        cx: this.resolvedCx(),
        cy: this.resolvedCy(),
        innerRadius: this.innerRadius(),
        outerRadius: this.resolvedOuterRadius(),
        startAngle: this.startAngle(),
        endAngle: this.endAngle(),
      });
    });
  }
}
