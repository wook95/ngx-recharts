import { Injectable, inject } from '@angular/core';
import { AxisRegistryService } from './axis-registry.service';

/**
 * Facade service for axis scale access.
 * Angular equivalent of Recharts scale hooks.
 */
@Injectable()
export class AxisScaleService {
  private readonly axisRegistry = inject(AxisRegistryService);

  /** Get X axis scale function (useXAxisScale equivalent) */
  xAxisScale(axisId: string = '0'): any {
    return this.axisRegistry.getXAxisScale(axisId);
  }

  /** Get Y axis scale function (useYAxisScale equivalent) */
  yAxisScale(axisId: string = '0'): any {
    return this.axisRegistry.getYAxisScale(axisId);
  }

  /** Get cartesian scale for an axis (useCartesianScale equivalent) */
  cartesianScale(type: 'x' | 'y', axisId: string = '0'): any {
    return type === 'x' ? this.xAxisScale(axisId) : this.yAxisScale(axisId);
  }

  /** Get X axis inverse scale - maps pixel to data value (useXAxisInverseScale equivalent) */
  xAxisInverseScale(axisId: string = '0'): ((pixel: number) => any) | undefined {
    const scale = this.xAxisScale(axisId);
    return scale?.invert ? (pixel: number) => scale.invert(pixel) : undefined;
  }

  /** Get Y axis inverse scale (useYAxisInverseScale equivalent) */
  yAxisInverseScale(axisId: string = '0'): ((pixel: number) => any) | undefined {
    const scale = this.yAxisScale(axisId);
    return scale?.invert ? (pixel: number) => scale.invert(pixel) : undefined;
  }

  /** Inverse scale that snaps to nearest data point (useXAxisInverseDataSnapScale equivalent) */
  xAxisInverseDataSnapScale(axisId: string = '0'): ((pixel: number) => any) | undefined {
    const axis = this.axisRegistry.getXAxis(axisId);
    if (!axis?.scale?.invert) return undefined;
    const data = axis.domain;
    return (pixel: number) => {
      const rawValue = axis.scale.invert(pixel);
      return this.snapToNearest(rawValue, data);
    };
  }

  /** Inverse scale that snaps to nearest data point (useYAxisInverseDataSnapScale equivalent) */
  yAxisInverseDataSnapScale(axisId: string = '0'): ((pixel: number) => any) | undefined {
    const axis = this.axisRegistry.getYAxis(axisId);
    if (!axis?.scale?.invert) return undefined;
    const data = axis.domain;
    return (pixel: number) => {
      const rawValue = axis.scale.invert(pixel);
      return this.snapToNearest(rawValue, data);
    };
  }

  /** Inverse scale that snaps to nearest tick (useXAxisInverseTickSnapScale equivalent) */
  xAxisInverseTickSnapScale(axisId: string = '0'): ((pixel: number) => any) | undefined {
    const axis = this.axisRegistry.getXAxis(axisId);
    if (!axis?.scale?.invert) return undefined;
    const ticks = axis.ticks;
    return (pixel: number) => {
      const rawValue = axis.scale.invert(pixel);
      return this.snapToNearest(rawValue, ticks);
    };
  }

  /** Inverse scale that snaps to nearest tick (useYAxisInverseTickSnapScale equivalent) */
  yAxisInverseTickSnapScale(axisId: string = '0'): ((pixel: number) => any) | undefined {
    const axis = this.axisRegistry.getYAxis(axisId);
    if (!axis?.scale?.invert) return undefined;
    const ticks = axis.ticks;
    return (pixel: number) => {
      const rawValue = axis.scale.invert(pixel);
      return this.snapToNearest(rawValue, ticks);
    };
  }

  private snapToNearest(value: any, candidates: any[]): any {
    if (!candidates || candidates.length === 0) return value;
    let closest = candidates[0];
    let minDist = Math.abs(Number(value) - Number(candidates[0]));
    for (let i = 1; i < candidates.length; i++) {
      const dist = Math.abs(Number(value) - Number(candidates[i]));
      if (dist < minDist) {
        minDist = dist;
        closest = candidates[i];
      }
    }
    return closest;
  }
}
