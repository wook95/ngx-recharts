import { InjectionToken, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectWidth, selectHeight, selectOffset } from '../store/chart.state';
import { toSignal } from '@angular/core/rxjs-interop';

export interface ChartLayout {
  width: () => number;
  height: () => number;
  margin: () => { top: number; right: number; bottom: number; left: number };
  plotWidth: () => number;
  plotHeight: () => number;
  plotArea: () => { width: number; height: number; x: number; y: number } | null;
  setDimensions: (width: number, height: number) => void;
  setPlotDimensions: (width: number, height: number) => void;
}

export const CHART_LAYOUT = new InjectionToken<ChartLayout>('ChartLayout');

export function useChartLayout(): ChartLayout {
  const store = inject(Store);

  // Signals for dimensions
  const width = signal(0);
  const height = signal(0);
  const margin = signal({ top: 5, right: 5, bottom: 5, left: 5 });

  // Local state for plot dimensions (set by ChartContainer)
  const _plotWidth = signal(0);
  const _plotHeight = signal(0);

  const setDimensions = (w: number, h: number) => {
    width.set(w);
    height.set(h);
  };

  const setPlotDimensions = (w: number, h: number) => {
    _plotWidth.set(w);
    _plotHeight.set(h);
  };

  const plotArea = computed(() => {
    const w = width();
    const h = height();
    const m = margin();

    if (w === 0 || h === 0) return null;

    return {
      width: w - m.left - m.right,
      height: h - m.top - m.bottom,
      x: m.left,
      y: m.top
    };
  });

  return {
    width: width.asReadonly(),
    height: height.asReadonly(),
    margin: margin.asReadonly(),
    plotWidth: _plotWidth.asReadonly(),
    plotHeight: _plotHeight.asReadonly(),
    plotArea,
    setDimensions,
    setPlotDimensions
  };
}
