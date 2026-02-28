import { Injectable, inject, signal, computed } from '@angular/core';
import { ChartData, ChartMargin, getNumericDataValue } from '../core/types';
import { GraphicalItemRegistryService } from './graphical-item-registry.service';

export type ChartType = 'line' | 'bar' | 'area' | 'composed' | 'pie' | 'radar' | 'radialBar' | 'scatter' | 'funnel';
export type YDomainMode = 'unified' | 'independent';

/**
 * Service to distribute chart-level data to child components via Angular hierarchical DI.
 *
 * This is the Angular equivalent of React recharts' Context-based data distribution.
 * Each chart component (LineChart, BarChart, AreaChart, ComposedChart) provides its own
 * instance and syncs its inputs into the service. Child components (Line, Bar, Area, XAxis, etc.)
 * inject this service optionally and fall back to explicit inputs when used standalone.
 *
 * @example
 * ```typescript
 * // In a chart component
 * @Component({
 *   providers: [ChartDataService, ...]
 * })
 * export class LineChartComponent {
 *   private chartDataService = inject(ChartDataService);
 *   constructor() {
 *     this.chartDataService.setChartType('line');
 *     effect(() => {
 *       this.chartDataService.setData(this.data());
 *       this.chartDataService.setMargin(this.margin());
 *       this.chartDataService.setYDomainMode(this.yDomainMode());
 *     });
 *   }
 * }
 *
 * // In a child component
 * export class LineComponent {
 *   private chartDataService = inject(ChartDataService, { optional: true });
 *   data = input<ChartData[]>([]);
 *   resolvedData = computed(() => {
 *     const explicit = this.data();
 *     return explicit.length > 0 ? explicit : (this.chartDataService?.data() ?? []);
 *   });
 * }
 * ```
 */
@Injectable()
export class ChartDataService {
  private readonly registryService = inject(GraphicalItemRegistryService, { optional: true });

  private readonly _data = signal<ChartData[]>([]);
  private readonly _chartType = signal<ChartType>('line');
  private readonly _margin = signal<ChartMargin>({ top: 10, right: 5, bottom: 5, left: 5 });
  private readonly _yDomainMode = signal<YDomainMode>('unified');

  /** Chart data array distributed from parent chart component */
  readonly data = this._data.asReadonly();

  /** Chart type distributed from parent chart component */
  readonly chartType = this._chartType.asReadonly();

  /** Chart margin distributed from parent chart component */
  readonly margin = this._margin.asReadonly();

  /** Y-domain mode: 'unified' shares a single domain across all items, 'independent' lets each item compute its own */
  readonly yDomainMode = this._yDomainMode.asReadonly();

  /**
   * Unified Y-domain computed across all visible graphical items.
   * Returns null when mode is 'independent', data is empty, or no items are registered.
   */
  readonly unifiedYDomain = computed<[number, number] | null>(() => {
    if (this._yDomainMode() === 'independent') return null;

    const data = this._data();
    const items = this.registryService?.visibleItems() ?? [];

    if (!data.length || !items.length) return null;

    let rawMin = Infinity;
    let rawMax = -Infinity;

    for (const item of items) {
      for (const d of data) {
        const v = getNumericDataValue(d, item.dataKey);
        if (v < rawMin) rawMin = v;
        if (v > rawMax) rawMax = v;
      }
    }

    if (!isFinite(rawMin)) return null;

    // Include 0 in domain (recharts behavior)
    const domainMin = rawMin > 0 ? 0 : rawMin;
    const domainMax = rawMax < 0 ? 0 : rawMax;

    return [domainMin, domainMax];
  });

  setData(data: ChartData[]): void {
    this._data.set(data);
  }

  setChartType(type: ChartType): void {
    this._chartType.set(type);
  }

  setMargin(margin: ChartMargin): void {
    this._margin.set(margin);
  }

  setYDomainMode(mode: YDomainMode): void {
    this._yDomainMode.set(mode);
  }
}
