import { Injectable, inject } from '@angular/core';
import { AxisRegistryService } from './axis-registry.service';

/**
 * Facade service for axis domain and tick information.
 * Angular equivalent of Recharts hooks: useXAxisDomain, useYAxisDomain, useXAxisTicks, useYAxisTicks.
 */
@Injectable()
export class AxisDomainService {
  private readonly axisRegistry = inject(AxisRegistryService);

  /** Get X axis domain by axisId (useXAxisDomain equivalent) */
  xAxisDomain(axisId: string = '0'): [any, any] | undefined {
    return this.axisRegistry.getXAxisDomain(axisId);
  }

  /** Get Y axis domain by axisId (useYAxisDomain equivalent) */
  yAxisDomain(axisId: string = '0'): [any, any] | undefined {
    return this.axisRegistry.getYAxisDomain(axisId);
  }

  /** Get X axis ticks by axisId (useXAxisTicks equivalent) */
  xAxisTicks(axisId: string = '0'): any[] {
    return this.axisRegistry.getXAxisTicks(axisId);
  }

  /** Get Y axis ticks by axisId (useYAxisTicks equivalent) */
  yAxisTicks(axisId: string = '0'): any[] {
    return this.axisRegistry.getYAxisTicks(axisId);
  }
}
