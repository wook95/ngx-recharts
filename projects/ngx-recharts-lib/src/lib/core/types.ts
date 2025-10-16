export type DataKey<T = any> = string | number | ((obj: T) => any);

export interface ChartData {
  [key: string]: any;
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