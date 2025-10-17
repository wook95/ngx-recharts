import { computed, Injectable, signal } from '@angular/core';
import { ChartMargin } from '../core/types';

export interface AxisOffset {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface LegendOffset {
  width: number;
  height: number;
}

@Injectable()
export class ResponsiveContainerService {
  private _width = signal<number>(0);
  private _height = signal<number>(0);
  private _margin = signal<ChartMargin>({
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
  });
  
  // Dynamic offsets for axes and legend
  private _axisOffset = signal<AxisOffset>({
    left: 60,   // Default Y-axis space
    right: 0,
    top: 0,
    bottom: 30, // Default X-axis space
  });
  
  private _legendOffset = signal<LegendOffset>({
    width: 0,
    height: 40, // Default legend space
  });

  readonly width = this._width.asReadonly();
  readonly height = this._height.asReadonly();
  readonly margin = this._margin.asReadonly();
  readonly axisOffset = this._axisOffset.asReadonly();
  readonly legendOffset = this._legendOffset.asReadonly();

  // Total offset calculation following recharts pattern
  readonly totalOffset = computed(() => {
    const margin = this._margin();
    const axisOffset = this._axisOffset();
    const legendOffset = this._legendOffset();
    
    return {
      left: margin.left + axisOffset.left,
      right: margin.right + axisOffset.right,
      top: margin.top + axisOffset.top,
      bottom: margin.bottom + axisOffset.bottom + legendOffset.height,
    };
  });

  // Plot area dimensions (chart dimensions minus all offsets)
  readonly plotWidth = computed(() => {
    const w = this._width();
    const offset = this.totalOffset();
    return Math.max(0, w - offset.left - offset.right);
  });

  readonly plotHeight = computed(() => {
    const h = this._height();
    const offset = this.totalOffset();
    return Math.max(0, h - offset.top - offset.bottom);
  });

  setDimensions(width: number, height: number): void {
    this._width.set(width);
    this._height.set(height);
  }

  setMargin(margin: ChartMargin): void {
    this._margin.set(margin);
  }
  
  setAxisOffset(offset: Partial<AxisOffset>): void {
    this._axisOffset.update(current => ({ ...current, ...offset }));
  }
  
  setLegendOffset(offset: Partial<LegendOffset>): void {
    this._legendOffset.update(current => ({ ...current, ...offset }));
  }
}
