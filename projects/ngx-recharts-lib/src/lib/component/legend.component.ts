import { Component, input, computed, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultLegendContentComponent } from './default-legend-content.component';
import { ChartLayoutService } from '../services/chart-layout.service';

export interface LegendPayload {
  value: string | undefined;
  type?: 'line' | 'plainline' | 'rect' | 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye' | 'none';
  color?: string;
  payload?: {
    strokeDasharray?: number | string;
    value?: any;
  };
  inactive?: boolean;
  dataKey?: string;
  formatter?: (value: any, entry: LegendPayload, index: number) => any;
}

export type LegendAlign = 'left' | 'center' | 'right';
export type LegendVerticalAlign = 'top' | 'middle' | 'bottom';
export type LegendLayout = 'horizontal' | 'vertical';

@Component({
  selector: 'ngx-legend',
  standalone: true,
  imports: [CommonModule, DefaultLegendContentComponent],
  template: `
    <div 
      class="recharts-legend-wrapper"
      [style]="legendStyle()"
      *ngIf="payload() && payload().length > 0">
      <ngx-default-legend-content
        [payload]="payload()"
        [layout]="layout()"
        [align]="align()"
        [verticalAlign]="verticalAlign()"
        [iconSize]="iconSize()"
        [iconType]="iconType()"
        [formatter]="formatter()"
        [onClick]="onClick()"
        [onMouseEnter]="onMouseEnter()"
        [onMouseLeave]="onMouseLeave()">
      </ngx-default-legend-content>
    </div>
  `,
  styles: [`
    .recharts-legend-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px 0;
    }
  `]
})
export class LegendComponent implements OnInit, OnDestroy {
  // Inputs - matching recharts API
  width = input<number>();
  height = input<number>();
  layout = input<LegendLayout>('horizontal');
  align = input<LegendAlign>('center');
  verticalAlign = input<LegendVerticalAlign>('bottom');
  iconSize = input<number>(14);
  iconType = input<'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye'>();
  payload = input<LegendPayload[]>([]);
  content = input<any>(); // ReactElement | Function
  formatter = input<(value: any, entry: LegendPayload, index: number) => any>();
  wrapperStyle = input<Record<string, any>>({});
  
  // Event handlers
  onClick = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();
  onMouseDown = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();
  onMouseUp = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();
  onMouseMove = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();
  onMouseOver = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();
  onMouseOut = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();
  onMouseEnter = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();
  onMouseLeave = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();

  // Services
  private chartLayoutService = inject(ChartLayoutService);

  // State
  private boundingBox = signal({ width: 0, height: 0 });

  // Computed
  legendStyle = computed(() => {
    const wrapperStyle = this.wrapperStyle();
    
    // Simple positioning for now - can be enhanced later
    const style: Record<string, any> = {
      position: 'relative',
      width: this.width() || 'auto',
      height: this.height() || 'auto',
      textAlign: this.align(),
      ...wrapperStyle
    };

    return style;
  });

  ngOnInit() {
    // Subscribe to chart data changes to update legend payload
    // This would be connected to chart data in a real implementation
  }

  ngOnDestroy() {
    // Cleanup subscriptions
  }

  updateBoundingBox(width: number, height: number) {
    this.boundingBox.set({ width, height });
  }
}