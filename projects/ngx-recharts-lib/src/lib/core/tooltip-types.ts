export interface TooltipViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AllowEscapeViewBox {
  x?: boolean;
  y?: boolean;
}

export type TooltipFormatter = (value: any, name: string, props: any) => string | [string, string];
export type LabelFormatter = (label: string, payload: any[]) => string;
export type ItemSorter = (a: any, b: any) => number;

export interface TooltipConfig {
  // Core properties
  separator?: string;
  offset?: number;
  filterNull?: boolean;
  
  // Style properties
  itemStyle?: Record<string, any>;
  wrapperStyle?: Record<string, any>;
  contentStyle?: Record<string, any>;
  labelStyle?: Record<string, any>;
  
  // Cursor properties
  cursor?: boolean | Record<string, any> | any;
  
  // ViewBox properties
  viewBox?: TooltipViewBox;
  allowEscapeViewBox?: AllowEscapeViewBox;
  
  // Position properties
  position?: { x: number; y: number };
  
  // Formatter functions
  formatter?: TooltipFormatter;
  labelFormatter?: LabelFormatter;
  itemSorter?: ItemSorter;
  
  // Behavior properties
  shared?: boolean;
  snapToDataPoint?: boolean; // Snap tooltip to exact data point coordinates
  
  // Animation properties
  isAnimationActive?: boolean;
  animationDuration?: number;
  animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

// Default tooltip configuration
export const DEFAULT_TOOLTIP_CONFIG: Required<TooltipConfig> = {
  separator: ' : ',
  offset: 10,
  filterNull: true,
  itemStyle: {},
  wrapperStyle: {},
  contentStyle: {},
  labelStyle: {},
  cursor: true,
  viewBox: undefined as any,
  allowEscapeViewBox: { x: false, y: false },
  position: undefined as any,
  formatter: undefined as any,
  labelFormatter: undefined as any,
  itemSorter: undefined as any,
  shared: true,
  snapToDataPoint: false,
  isAnimationActive: true,
  animationDuration: 1500,
  animationEasing: 'ease'
};