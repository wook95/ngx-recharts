import { computed, Injectable, inject } from '@angular/core';
import { ResponsiveContainerService } from './responsive-container.service';

/**
 * Facade service providing chart dimension signals.
 * Angular equivalent of Recharts hooks: useMargin, useOffset, usePlotArea, useChartWidth, useChartHeight.
 * Provided per-chart alongside ResponsiveContainerService.
 */
@Injectable()
export class ChartDimensionService {
  private readonly responsiveService = inject(ResponsiveContainerService);

  /** Current chart margin (useMargin equivalent) */
  readonly margin = this.responsiveService.margin;

  /** Current axis offsets (useOffset equivalent) */
  readonly offset = this.responsiveService.axisOffset;

  /** Current plot area dimensions (usePlotArea equivalent) */
  readonly plotArea = computed(() => {
    const totalOffset = this.responsiveService.totalOffset();
    return {
      x: totalOffset.left,
      y: totalOffset.top,
      width: this.responsiveService.plotWidth(),
      height: this.responsiveService.plotHeight(),
    };
  });

  /** Total chart width including margins (useChartWidth equivalent) */
  readonly chartWidth = this.responsiveService.width;

  /** Total chart height including margins (useChartHeight equivalent) */
  readonly chartHeight = this.responsiveService.height;
}
