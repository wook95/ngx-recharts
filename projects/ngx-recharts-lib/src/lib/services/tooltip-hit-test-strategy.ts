import { InjectionToken } from '@angular/core';

export interface TooltipHitTestResult {
  coordinate: { x: number; y: number };
  dataIndex: number;
  activeLabel?: string;
}

export interface TooltipHitTestStrategy {
  hitTest(
    mouseX: number,
    mouseY: number,
    context: TooltipHitTestContext
  ): TooltipHitTestResult | null;
}

export interface TooltipHitTestContext {
  data: any[];
  plotWidth: number;
  plotHeight: number;
  offsetLeft: number;
  offsetTop: number;
  chartType: string;
  registryItems: any[];  // GraphicalItemInfo[]
}

export const TOOLTIP_HIT_TEST_STRATEGY = new InjectionToken<TooltipHitTestStrategy>(
  'TOOLTIP_HIT_TEST_STRATEGY'
);
