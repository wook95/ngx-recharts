import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { DefaultLegendContentComponent } from './default-legend-content.component';
import { ResponsiveContainerComponent } from './responsive-container.component';

export interface LegendPayload {
  value: string | undefined;
  type?:
    | 'line'
    | 'plainline'
    | 'rect'
    | 'circle'
    | 'cross'
    | 'diamond'
    | 'square'
    | 'star'
    | 'triangle'
    | 'wye'
    | 'none';
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
      #legendWrapper
      class="recharts-legend-wrapper"
      [style]="legendStyle()"
      *ngIf="payload() && payload().length > 0"
    >
      <ngx-default-legend-content
        [payload]="payload()"
        [layout]="layout()"
        [align]="align()"
        [verticalAlign]="verticalAlign()"
        [iconSize]="iconSize()"
        [iconType]="iconType()"
        [formatter]="formatter()"
        [onClick]="handleClick"
        [onMouseEnter]="handleMouseEnter"
        [onMouseLeave]="handleMouseLeave"
      >
      </ngx-default-legend-content>
    </div>
  `,
  styles: [
    `
      .recharts-legend-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `,
  ],
})
export class LegendComponent implements OnInit, OnDestroy {
  // Inputs - matching recharts API
  width = input<number>();
  height = input<number>();
  layout = input<LegendLayout>('horizontal');
  align = input<LegendAlign>('center');
  verticalAlign = input<LegendVerticalAlign>('bottom');
  iconSize = input<number>(14);
  iconType = input<
    | 'line'
    | 'plainline'
    | 'square'
    | 'rect'
    | 'circle'
    | 'cross'
    | 'diamond'
    | 'star'
    | 'triangle'
    | 'wye'
  >();
  payload = input<LegendPayload[]>([]);
  content = input<any>(); // ReactElement | Function
  formatter = input<(value: any, entry: LegendPayload, index: number) => any>();
  wrapperStyle = input<Record<string, any>>({});

  constructor() {
    // Effect to get portal target from ResponsiveContainer
    effect(() => {
      if (this.responsiveContainer) {
        this.portalTarget = this.responsiveContainer.getWrapperElement();
      }
    });

    // Effect to observe legend size changes
    effect(() => {
      const wrapper = this.legendWrapper();
      if (wrapper) {
        this.observeLegendSize(wrapper.nativeElement);
      }
    });
  }

  // Event outputs - Angular style
  legendClick = output<{ data: LegendPayload; index: number; event: MouseEvent }>();
  legendMouseEnter = output<{ data: LegendPayload; index: number; event: MouseEvent }>();
  legendMouseLeave = output<{ data: LegendPayload; index: number; event: MouseEvent }>();
  
  // Internal event handlers for DefaultLegendContent
  handleClick = (data: LegendPayload, index: number, event: MouseEvent) => {
    this.legendClick.emit({ data, index, event });
  };
  
  handleMouseEnter = (data: LegendPayload, index: number, event: MouseEvent) => {
    this.legendMouseEnter.emit({ data, index, event });
  };
  
  handleMouseLeave = (data: LegendPayload, index: number, event: MouseEvent) => {
    this.legendMouseLeave.emit({ data, index, event });
  };

  // Services
  private responsiveService = inject(ResponsiveContainerService, {
    optional: true,
  });
  private responsiveContainer = inject(ResponsiveContainerComponent, {
    optional: true,
  });

  // ViewChild
  legendWrapper = viewChild<ElementRef<HTMLDivElement>>('legendWrapper');

  // State
  private boundingBox = signal({ width: 0, height: 0 });
  private resizeObserver?: ResizeObserver;
  private portalTarget: HTMLElement | null = null;

  // Computed
  legendStyle = computed(() => {
    const wrapperStyle = this.wrapperStyle();
    const containerWidth = this.responsiveService?.width() || 0;
    const containerHeight = this.responsiveService?.height() || 0;
    const bbox = this.boundingBox();
    const axisInfo = this.responsiveService?.axisInfo();

    // recharts-style absolute positioning - no padding needed
    const style: Record<string, any> = {
      position: 'absolute',
      width: this.width() || containerWidth || 'auto',
      height: this.height() || 'auto',
      textAlign: this.align(),
      ...this.getDefaultPosition(containerWidth, containerHeight, bbox),
      ...wrapperStyle,
    };

    return style;
  });

  private getDefaultPosition(
    chartWidth: number,
    chartHeight: number,
    box: { width: number; height: number }
  ) {
    const { align, verticalAlign } = this;
    let hPos: Record<string, any> = {};
    let vPos: Record<string, any> = {};

    // Get plot area dimensions for proper alignment
    const plotWidth = this.responsiveService?.plotWidth() || 0;
    const totalOffset = this.responsiveService?.totalOffset();
    const leftOffset = totalOffset?.left || 0;
    const topOffset = totalOffset?.top || 0;

    // Horizontal positioning - align to plot area, not full chart
    if (align() === 'center') {
      hPos = { left: `${leftOffset + (plotWidth - box.width) / 2}px` };
    } else if (align() === 'right') {
      hPos = { left: `${leftOffset + plotWidth - box.width}px` };
    } else {
      hPos = { left: `${leftOffset}px` };
    }

    // Vertical positioning - legend positioned in reserved space
    if (verticalAlign() === 'middle') {
      vPos = { top: `${((chartHeight || 0) - box.height) / 2}px` };
    } else if (verticalAlign() === 'bottom') {
      // Position legend in the bottom reserved space with dynamic spacing
      const plotHeight = this.responsiveService?.plotHeight() || 0;
      const axisInfo = this.responsiveService?.axisInfo();
      const hasBottomXAxis = axisInfo?.hasBottomXAxisLabel || false;

      // More spacing when X-axis is at bottom to avoid overlap
      const legendSpacing = hasBottomXAxis ? 46 : 10;
      vPos = { top: `${topOffset + plotHeight + legendSpacing}px` };
    } else {
      // Position legend in the top reserved space
      vPos = { top: '10px' };
    }

    return { ...hPos, ...vPos };
  }

  ngOnInit() {
    // Subscribe to chart data changes to update legend payload
    // This would be connected to chart data in a real implementation
  }

  ngOnDestroy() {
    this.cleanupResizeObserver();
  }

  private observeLegendSize(element: HTMLElement): void {
    this.cleanupResizeObserver();

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        this.updateBoundingBox(width, height);
      }
    });

    this.resizeObserver.observe(element);

    // Initial size calculation
    const rect = element.getBoundingClientRect();
    this.updateBoundingBox(rect.width, rect.height);
  }

  private cleanupResizeObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  updateBoundingBox(width: number, height: number) {
    this.boundingBox.set({ width, height });

    // Update responsive service with legend size - recharts style (exact size only)
    if (this.responsiveService) {
      this.responsiveService.setLegendOffset({ height: height });
    }
  }
}
