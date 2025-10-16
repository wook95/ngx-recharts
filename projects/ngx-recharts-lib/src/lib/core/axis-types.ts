export type AxisOrientation = 'top' | 'bottom' | 'left' | 'right';
export type AxisType = 'number' | 'category';
export type AxisDomain = [number, number] | [string, string] | 'auto';

export interface AxisTick {
  value: any;
  coordinate: number;
}

export interface AxisProps {
  type?: AxisType;
  dataKey?: string;
  domain?: AxisDomain;
  orientation?: AxisOrientation;
  tick?: boolean;
  tickCount?: number;
  tickFormatter?: (value: any) => string;
  label?: string;
  unit?: string;
  hide?: boolean;
}