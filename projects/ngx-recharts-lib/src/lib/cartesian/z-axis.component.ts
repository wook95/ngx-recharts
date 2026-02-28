import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  effect,
  inject,
  input,
} from '@angular/core';
import { AxisType } from '../core/axis-types';
import { AxisRegistryService } from '../services/axis-registry.service';
import { ChartDataService } from '../services/chart-data.service';
import { ScaleService } from '../services/scale.service';

@Component({
  selector: 'svg:g[ngx-z-axis]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg:g></svg:g>`,
})
export class ZAxisComponent implements OnDestroy {
  // Z-axis specific configuration
  dataKey = input<string>();
  zAxisId = input<string>('0');
  range = input<[number, number]>([64, 400]);
  type = input<AxisType>('number');
  domain = input<[number | 'auto', number | 'auto']>(['auto', 'auto']);
  unit = input<string>('');
  name = input<string>('');

  private axisRegistry = inject(AxisRegistryService, { optional: true });
  private chartDataService = inject(ChartDataService, { optional: true });
  private scaleService = inject(ScaleService);

  constructor() {
    effect(() => {
      const data = this.chartDataService?.data() ?? [];
      const dk = this.dataKey();
      const range = this.range();
      const domainConfig = this.domain();

      if (!dk || !this.axisRegistry) return;

      // Compute actual domain from data
      let min = Infinity, max = -Infinity;
      for (const item of data) {
        const v = Number(item[dk] ?? 0);
        if (isFinite(v)) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
      if (!isFinite(min)) { min = 0; max = 1; }

      const actualDomain: [number, number] = [
        domainConfig[0] === 'auto' ? min : Number(domainConfig[0]),
        domainConfig[1] === 'auto' ? max : Number(domainConfig[1]),
      ];

      const scale = this.scaleService.createLinearScale(actualDomain, range);

      this.axisRegistry.registerAxis({
        axisId: this.zAxisId(),
        type: 'z',
        scale,
        domain: actualDomain,
        range,
        ticks: [],
        dataKey: dk,
      });
    });
  }

  ngOnDestroy(): void {
    this.axisRegistry?.unregisterAxis('z', this.zAxisId());
  }
}
