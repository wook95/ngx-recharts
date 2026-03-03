/**
 * Shared event types for ngx-recharts chart interactions.
 * Mirrors Recharts event callback signatures using Angular output() pattern.
 */

export interface ChartMouseEvent<T = any> {
  /** The native browser MouseEvent */
  nativeEvent: MouseEvent;
  /** The dataKey of the graphical item that triggered the event */
  dataKey?: string;
  /** The value at the event point */
  value?: any;
  /** The full data payload of the item */
  payload: T;
  /** The index of the data point in the dataset */
  index: number;
  /** The SVG coordinate of the event */
  coordinate?: { x: number; y: number };
}

/** Event emitted by Line component interactions */
export type LineClickEvent<T = any> = ChartMouseEvent<T>;

/** Event emitted by Bar component interactions */
export type BarClickEvent<T = any> = ChartMouseEvent<T>;

/** Event emitted by Area component interactions */
export type AreaClickEvent<T = any> = ChartMouseEvent<T>;

/** Event emitted by Pie/Sector component interactions */
export type PieClickEvent<T = any> = ChartMouseEvent<T>;

/** Event emitted by Scatter component interactions */
export type ScatterClickEvent<T = any> = ChartMouseEvent<T>;

/** Event emitted by Radar component interactions */
export type RadarClickEvent<T = any> = ChartMouseEvent<T>;

/** Event emitted by RadialBar component interactions */
export type RadialBarClickEvent<T = any> = ChartMouseEvent<T>;

/** Event emitted by Funnel component interactions */
export type FunnelClickEvent<T = any> = ChartMouseEvent<T>;

/** Event emitted by Legend interactions */
export interface LegendClickEvent {
  dataKey: string;
  type: string;
  color: string;
  inactive: boolean;
  index: number;
}
