import { computed, Signal } from '@angular/core';
import { ResponsiveContainerService } from '../services/responsive-container.service';

export interface PlotArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

export function createChartDimensions(
  responsiveService: ResponsiveContainerService | null,
  chartWidth: Signal<number>,
  chartHeight: Signal<number>,
  margin: Signal<{ top: number; right: number; bottom: number; left: number }>
) {
  const actualWidth = computed(() => {
    const responsiveWidth = responsiveService?.width() ?? 0;
    return responsiveWidth > 0 ? responsiveWidth : chartWidth();
  });

  const actualHeight = computed(() => {
    const responsiveHeight = responsiveService?.height() ?? 0;
    return responsiveHeight > 0 ? responsiveHeight : chartHeight();
  });

  const plotArea = computed((): PlotArea => {
    const plotWidth = responsiveService?.plotWidth() ?? 0;
    const plotHeight = responsiveService?.plotHeight() ?? 0;

    if (plotWidth > 0 && plotHeight > 0) {
      return { width: plotWidth, height: plotHeight, x: 0, y: 0 };
    }

    const m = margin();
    return {
      width: actualWidth() - m.left - m.right,
      height: actualHeight() - m.top - m.bottom,
      x: m.left,
      y: m.top,
    };
  });

  return { actualWidth, actualHeight, plotArea };
}
