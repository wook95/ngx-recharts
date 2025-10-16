export type DataKey<T = any> = string | number | ((obj: T) => any);

export interface ChartData {
  [key: string]: any;
}

// More specific interface for common chart data patterns
export interface TypedChartData<T = Record<string, number | string>> extends ChartData {
  name?: string;
}

// Utility function to safely access chart data properties
export function getDataValue(item: ChartData, key: string): any {
  return (item as Record<string, any>)[key];
}

// Type-safe data value getter with default
export function getNumericDataValue(item: ChartData, key: string, defaultValue: number = 0): number {
  const value = getDataValue(item, key);
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
}

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartOffset {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

export interface PlotArea {
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
}

export type LegendType = 'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none';

export type AnimationTiming = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

export type AnimationDuration = number | string;