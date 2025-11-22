import { InjectionToken, Signal, signal, WritableSignal } from '@angular/core';
import { ChartData } from '../core/types';

export interface ChartDataContext {
  data: Signal<ChartData[]>;
  setData: (data: ChartData[]) => void;
}

export const CHART_DATA = new InjectionToken<ChartDataContext>('ChartData');

export function useChartData(): ChartDataContext {
  const _data = signal<ChartData[]>([]);

  const setData = (data: ChartData[]) => {
    _data.set(data);
  };

  return {
    data: _data.asReadonly(),
    setData
  };
}
