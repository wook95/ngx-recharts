/**
 * Polar coordinate utilities
 */

export interface PolarPoint {
  x: number;
  y: number;
}

/**
 * Convert polar coordinates to cartesian coordinates.
 *
 * Uses chart convention where 0 degrees points to 12 o'clock (top)
 * and angles increase clockwise. This matches the convention used by
 * recharts and PolarCoordinateService.
 *
 * The conversion applies a -90 degree rotation so that:
 *   0 deg -> top (12 o'clock)
 *  90 deg -> right (3 o'clock)
 * 180 deg -> bottom (6 o'clock)
 * 270 deg -> left (9 o'clock)
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number
): PolarPoint {
  const radian = (angle - 90) * Math.PI / 180;
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
