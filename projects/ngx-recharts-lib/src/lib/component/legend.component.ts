import { ChangeDetectionStrategy, Component, input, inject, computed, output } from '@angular/core';

import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { DefaultLegendContentComponent } from './default-legend-content.component';
import { LegendClickEvent } from '../core/event-types';

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
  imports: [DefaultLegendContentComponent],
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
        [formatter]="formatter()"
        (legendItemClick)="legendClick.emit($event)"
        (legendItemMouseEnter)="legendMouseEnter.emit($event)"
        (legendItemMouseLeave)="legendMouseLeave.emit($event)">
      </ngx-default-legend-content>
    </div>
  `
})
export class LegendComponent {
  private registry = inject(GraphicalItemRegistryService, { optional: true });

  // Outputs
  legendClick = output<LegendClickEvent>();
  legendMouseEnter = output<LegendClickEvent>();
  legendMouseLeave = output<LegendClickEvent>();

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
