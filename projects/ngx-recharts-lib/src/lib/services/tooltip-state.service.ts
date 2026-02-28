import { Injectable, inject, computed } from '@angular/core';
import { TooltipService } from './tooltip.service';

/**
 * Facade service for tooltip state signals.
 * Angular equivalent of Recharts hooks: useIsTooltipActive, useActiveTooltipCoordinate,
 * useActiveTooltipDataPoints, useActiveTooltipLabel.
 */
@Injectable()
export class TooltipStateService {
  private readonly tooltipService = inject(TooltipService);

  /** Whether the tooltip is currently active/visible (useIsTooltipActive equivalent) */
  readonly isTooltipActive = computed(() => this.tooltipService.active());

  /** Current tooltip coordinate {x, y} (useActiveTooltipCoordinate equivalent) */
  readonly activeTooltipCoordinate = computed(() => this.tooltipService.coordinate());

  /** Current tooltip payload data points (useActiveTooltipDataPoints equivalent) */
  readonly activeTooltipDataPoints = computed(() => this.tooltipService.payload());

  /** Current tooltip label string (useActiveTooltipLabel equivalent) */
  readonly activeTooltipLabel = computed(() => this.tooltipService.label());
}
