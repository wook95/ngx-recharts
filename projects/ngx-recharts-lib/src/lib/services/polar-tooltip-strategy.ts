import { Injectable, inject } from '@angular/core';
import { PolarCoordinateService } from './polar-coordinate.service';
import {
  TooltipHitTestStrategy,
  TooltipHitTestContext,
  TooltipHitTestResult,
} from './tooltip-hit-test-strategy';

@Injectable()
export class PolarTooltipStrategy implements TooltipHitTestStrategy {
  private polarService = inject(PolarCoordinateService);

  hitTest(
    mouseX: number,
    mouseY: number,
    context: TooltipHitTestContext
  ): TooltipHitTestResult | null {
    const { angle, radius } = this.polarService.cartesianToPolar(
      mouseX - context.offsetLeft,
      mouseY - context.offsetTop
    );

    const outerRadius = this.polarService.outerRadius();
    if (radius > outerRadius) return null;

    const data = context.data;
    if (!data || data.length === 0) return null;

    const anglePerItem = 360 / data.length;
    const dataIndex = Math.floor(angle / anglePerItem) % data.length;
    const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));

    return {
      coordinate: { x: mouseX - context.offsetLeft, y: mouseY - context.offsetTop },
      dataIndex: clampedIndex,
      activeLabel: data[clampedIndex]?.name ?? String(clampedIndex),
    };
  }
}
