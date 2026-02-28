import { Injectable } from '@angular/core';
import {
  TooltipHitTestStrategy,
  TooltipHitTestContext,
  TooltipHitTestResult,
} from './tooltip-hit-test-strategy';

@Injectable()
export class CartesianTooltipStrategy implements TooltipHitTestStrategy {
  hitTest(
    mouseX: number,
    mouseY: number,
    context: TooltipHitTestContext
  ): TooltipHitTestResult | null {
    const { data, plotWidth, offsetLeft, chartType, registryItems } = context;

    if (!data || data.length === 0) return null;

    const isBarMode =
      chartType === 'bar' ||
      (chartType === 'composed' &&
        registryItems.some((item: any) => item.type === 'bar'));

    if (isBarMode) {
      return this.handleBar(mouseX, data, plotWidth, offsetLeft);
    }
    return this.handleLineArea(mouseX, data, plotWidth, offsetLeft);
  }

  private handleLineArea(
    x: number,
    data: any[],
    plotWidth: number,
    offsetLeft: number
  ): TooltipHitTestResult {
    const dataIndex = Math.round((x / plotWidth) * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));
    const exactX = (clampedIndex / Math.max(data.length - 1, 1)) * plotWidth;
    const item = data[clampedIndex];

    return {
      coordinate: { x: exactX + offsetLeft, y: 0 },
      dataIndex: clampedIndex,
      activeLabel: item?.name != null ? String(item.name) : undefined,
    };
  }

  private handleBar(
    x: number,
    data: any[],
    plotWidth: number,
    offsetLeft: number
  ): TooltipHitTestResult {
    const barWidth = plotWidth / data.length;
    const dataIndex = Math.floor(x / barWidth);
    const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));
    const barCenterX = (dataIndex + 0.5) * barWidth;
    const item = data[clampedIndex];

    return {
      coordinate: { x: barCenterX + offsetLeft, y: 0 },
      dataIndex: clampedIndex,
      activeLabel: item?.name != null ? String(item.name) : undefined,
    };
  }
}
