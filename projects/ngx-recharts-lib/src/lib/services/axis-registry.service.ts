import { Injectable, signal } from '@angular/core';

export interface AxisRegistration {
  axisId: string;
  type: 'x' | 'y' | 'z';
  scale: any; // D3 scale function
  domain: [any, any];
  range: [number, number];
  ticks: any[];
  dataKey?: string;
  orientation?: string;
}

@Injectable()
export class AxisRegistryService {
  private readonly _axes = signal<Map<string, AxisRegistration>>(new Map());

  readonly axes = this._axes.asReadonly();

  registerAxis(registration: AxisRegistration): void {
    this._axes.update(map => {
      const newMap = new Map(map);
      newMap.set(`${registration.type}-${registration.axisId}`, registration);
      return newMap;
    });
  }

  unregisterAxis(type: 'x' | 'y' | 'z', axisId: string): void {
    this._axes.update(map => {
      const newMap = new Map(map);
      newMap.delete(`${type}-${axisId}`);
      return newMap;
    });
  }

  getXAxis(axisId: string = '0'): AxisRegistration | undefined {
    return this._axes().get(`x-${axisId}`);
  }

  getYAxis(axisId: string = '0'): AxisRegistration | undefined {
    return this._axes().get(`y-${axisId}`);
  }

  getZAxis(axisId: string = '0'): AxisRegistration | undefined {
    return this._axes().get(`z-${axisId}`);
  }

  getXAxisScale(axisId: string = '0'): any {
    return this.getXAxis(axisId)?.scale;
  }

  getYAxisScale(axisId: string = '0'): any {
    return this.getYAxis(axisId)?.scale;
  }

  getXAxisDomain(axisId: string = '0'): [any, any] | undefined {
    return this.getXAxis(axisId)?.domain;
  }

  getYAxisDomain(axisId: string = '0'): [any, any] | undefined {
    return this.getYAxis(axisId)?.domain;
  }

  getXAxisTicks(axisId: string = '0'): any[] {
    return this.getXAxis(axisId)?.ticks ?? [];
  }

  getYAxisTicks(axisId: string = '0'): any[] {
    return this.getYAxis(axisId)?.ticks ?? [];
  }
}
