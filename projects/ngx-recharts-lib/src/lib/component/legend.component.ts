import { ChangeDetectionStrategy, Component, input, inject, computed, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { DefaultLegendContentComponent } from './default-legend-content.component';

export type LegendLayout = 'horizontal' | 'vertical';
export type LegendAlign = 'left' | 'center' | 'right';
export type LegendVerticalAlign = 'top' | 'middle' | 'bottom';

export interface LegendPayload {
  value: any;
  type?: 'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
  color?: string;
  inactive?: boolean;
  dataKey?: string;
  payload?: {
    strokeDasharray?: string | number;
    [key: string]: any;
  };
  formatter?: (value: any, entry: LegendPayload, index: number) => any;
}

@Component({
  selector: 'ngx-legend',
  standalone: true,
  imports: [CommonModule, DefaultLegendContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="recharts-legend-wrapper" [style]="wrapperStyle()">
      <ngx-default-legend-content
        [payload]="resolvedPayload()"
        [layout]="layout()"
        [align]="align()"
        [verticalAlign]="verticalAlign()"
        [iconSize]="iconSize()"
        [iconType]="iconType()"
        [formatter]="formatter()">
      </ngx-default-legend-content>
    </div>
  `
})
export class LegendComponent {
  private registry = inject(GraphicalItemRegistryService, { optional: true });

  // Inputs
  layout = input<LegendLayout>('horizontal');
  align = input<LegendAlign>('center');
  verticalAlign = input<LegendVerticalAlign>('middle');
  iconSize = input<number>(14);
  iconType = input<'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye'>();
  formatter = input<(value: any, entry: LegendPayload, index: number) => any>();
  payload = input<LegendPayload[]>();

  // Resolve payload: use manual override if provided, otherwise auto-generate from registry
  resolvedPayload = computed<LegendPayload[]>(() => {
    const manualPayload = this.payload();
    if (manualPayload !== undefined) {
      return manualPayload;
    }
    if (this.registry) {
      return this.registry.generateLegendPayload() as LegendPayload[];
    }
    return [];
  });

  wrapperStyle = computed(() => ({
    textAlign: this.align()
  }));
}
