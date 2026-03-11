import { computed, inject, Injectable } from '@angular/core';
import { AxisRegistryService } from './axis-registry.service';

let nextChartId = 0;

@Injectable()
export class ClipPathService {
  private axisRegistry = inject(AxisRegistryService);

  readonly clipPathId = `recharts-clip-${nextChartId++}`;

  readonly clipPathUrl = computed(() => `url(#${this.clipPathId})`);

  readonly shouldClip = computed(() => {
    const axes = this.axisRegistry.axes();
    for (const registration of axes.values()) {
      if (registration.allowDataOverflow) {
        return true;
      }
    }
    return false;
  });
}
