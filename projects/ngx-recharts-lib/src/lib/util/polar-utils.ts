/**
 * Polar coordinate utilities
 */

export interface PolarPoint {
  x: number;
  y: number;
}

/**
 * Convert polar coordinates to cartesian coordinates
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number
): PolarPoint {
  const radian = (Math.PI / 180) * angle;
  return {
    x: cx + radius * Math.cos(radian),
    y: cy + radius * Math.sin(radian)
  };
}

/**
 * Get the sign of a number
 */
export function mathSign(value: number): number {
  return value === 0 ? 0 : value > 0 ? 1 : -1;
}

/**
 * Calculate delta angle between start and end angles
 */
export function getDeltaAngle(startAngle: number, endAngle: number): number {
  const sign = mathSign(endAngle - startAngle);
  const deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);
  return sign * deltaAngle;
}
