import { Injectable, signal, computed } from '@angular/core';

/**
 * @deprecated Use ResponsiveContainerService for layout dimensions or ChartDataService for chart data distribution.
 * Retained for backward compatibility with LabelComponent and SurfaceComponent.
 * Will be removed once those consumers are migrated.
 */
@Injectable()
export class ChartLayoutService {
  private readonly _width = signal(0);
  private readonly _height = signal(0);
  private readonly _offset = signal({ top: 0, bottom: 0, left: 0, right: 0 });

  // Public read-only signals
  readonly width = this._width.asReadonly();
  readonly height = this._height.asReadonly();
  readonly offset = this._offset.asReadonly();

  // Computed properties for compatibility
  readonly chartWidth = computed(() => this._width());
  readonly chartHeight = computed(() => this._height());
  readonly margin = computed(() => this._offset());

  // Computed plot area
  readonly plotArea = computed(() => {
    const w = this._width();
    const h = this._height();
    const o = this._offset();

    if (w === 0 || h === 0) return null;

    return {
      width: w - o.left - o.right,
      height: h - o.top - o.bottom,
      x: o.left,
      y: o.top
    };
  });

  setWidth(width: number): void {
    this._width.set(width);
  }

  setHeight(height: number): void {
    this._height.set(height);
  }

  setOffset(offset: { top: number; bottom: number; left: number; right: number }): void {
    this._offset.set(offset);
  }

  setDimensions(width: number, height: number): void {
    this._width.set(width);
    this._height.set(height);
  }
}
