/**
 * Given a MouseEvent and an SVG/HTML element, returns the relative {x, y} coordinate.
 */
export function getRelativeCoordinate(event: MouseEvent, element: Element): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
