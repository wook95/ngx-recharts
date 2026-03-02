/**
 * Label and LabelList type definitions
 */

// Cartesian ViewBox (기존)
export interface CartesianViewBox {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// Trapezoid ViewBox (Funnel 차트용)
export interface TrapezoidViewBox {
  x: number;
  y: number;
  upperWidth: number;
  lowerWidth: number;
  width: number;
  height: number;
}

// Polar ViewBox (Pie, RadialBar 차트용)
export interface PolarViewBox {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  clockWise?: boolean;
}

// Union type
export type ViewBox = CartesianViewBox | PolarViewBox | TrapezoidViewBox;

// Type guards
export function isPolarViewBox(viewBox: ViewBox): viewBox is PolarViewBox {
  return 'cx' in viewBox && typeof viewBox.cx === 'number';
}

export function isTrapezoidViewBox(viewBox: ViewBox): viewBox is TrapezoidViewBox {
  return 'upperWidth' in viewBox && 'lowerWidth' in viewBox;
}

export function isCartesianViewBox(viewBox: ViewBox): viewBox is CartesianViewBox {
  return !isPolarViewBox(viewBox) && !isTrapezoidViewBox(viewBox);
}

// Cartesian to Trapezoid 변환
export function cartesianToTrapezoid(viewBox: CartesianViewBox): TrapezoidViewBox {
  const { x = 0, y = 0, width = 0, height = 0 } = viewBox;
  return {
    x,
    y,
    upperWidth: width,
    lowerWidth: width,
    width,
    height
  };
}
