import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { TooltipComponent } from '../component/tooltip.component';
import { DEFAULT_TOOLTIP_CONFIG, TooltipConfig } from '../core/tooltip-types';
import { ChartData, ChartMargin, getNumericDataValue } from '../core/types';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipService } from '../services/tooltip.service';
import { SurfaceComponent } from './surface.component';
import { CHART_TOOLTIP_SERVICE } from '../core/chart-context.token';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { ScaleService } from '../services/scale.service';
import { TOOLTIP_HIT_TEST_STRATEGY, TooltipHitTestStrategy } from '../services/tooltip-hit-test-strategy';

@Component({
  selector: 'ngx-chart-container',
  standalone: true,
  imports: [SurfaceComponent, TooltipComponent],

  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="recharts-wrapper"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave($event)"
    >
      <ngx-recharts-surface [width]="chartWidth()" [height]="chartHeight()">
        <!-- Chart background -->
        <svg:rect
          [attr.width]="chartWidth()"
          [attr.height]="chartHeight()"
          fill="#fff"
        />
        <svg:g [attr.transform]="chartTransform()">
          <!-- Plot area background -->
          <svg:rect
            [attr.width]="plotWidth()"
            [attr.height]="plotHeight()"
            fill="white"
            stroke="#ccc"
          />
          <ng-content></ng-content>
        </svg:g>
      </ngx-recharts-surface>

      <!-- Tooltip with service binding -->
      <div class="tooltip-container">
        @if (_tooltipService) {
          <ngx-tooltip
            [active]="_tooltipService.active()"
            [payload]="_tooltipService.payload()"
            [label]="_tooltipService.label()"
            [coordinate]="_tooltipService.coordinate()"
            [separator]="tooltipConfig().separator"
            [offset]="tooltipConfig().offset"
            [filterNull]="tooltipConfig().filterNull"
            [itemStyle]="tooltipConfig().itemStyle"
            [wrapperStyle]="tooltipConfig().wrapperStyle"
            [contentStyle]="tooltipConfig().contentStyle"
            [labelStyle]="tooltipConfig().labelStyle"
            [cursor]="tooltipConfig().cursor"
            [viewBox]="tooltipConfig().viewBox"
            [allowEscapeViewBox]="tooltipConfig().allowEscapeViewBox"
            [position]="tooltipConfig().position"
            [formatter]="tooltipConfig().formatter"
            [labelFormatter]="tooltipConfig().labelFormatter"
            [itemSorter]="tooltipConfig().itemSorter"
            [shared]="tooltipConfig().shared"
            [snapToDataPoint]="tooltipConfig().snapToDataPoint"
            [isAnimationActive]="tooltipConfig().isAnimationActive"
            [animationDuration]="tooltipConfig().animationDuration"
            [animationEasing]="tooltipConfig().animationEasing"
          >
          </ngx-tooltip>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .recharts-wrapper {
        position: relative;
        cursor: default;
        user-select: none;
      }

      .tooltip-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
      }
    `,
  ],
})
export class ChartContainerComponent {
  protected _tooltipService = inject(TooltipService, { optional: true }) || inject(CHART_TOOLTIP_SERVICE, { optional: true });
  private registryService = inject(GraphicalItemRegistryService, { optional: true });
  private scaleService = inject(ScaleService);
  private hitTestStrategy = inject(TOOLTIP_HIT_TEST_STRATEGY, { optional: true }) as TooltipHitTestStrategy | null;

  protected get tooltipService(): TooltipService {
    if (!this._tooltipService) {
      throw new Error('TooltipService not found. Make sure it is provided in the chart component.');
    }
    return this._tooltipService;
  }
  private elementRef = inject(ElementRef);
  private responsiveService = inject(ResponsiveContainerService, {
    optional: true,
  });
  private lastMouseMoveTime = 0;
  private currentDataIndex = -1;

  tooltipComponent = contentChild(TooltipComponent);

  data = input.required<ChartData[]>();
  width = input<number>(400);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 5, right: 5, bottom: 5, left: 5 });
  chartType = input<'line' | 'bar' | 'area' | 'composed' | 'pie' | 'radar' | 'radialBar' | string>('line');
  categoryKey = input<string>('name');

  // Tooltip configuration (recharts API)
  tooltip = input<TooltipConfig>({});

  // Merged tooltip configuration with defaults
  tooltipConfig = computed(() => ({
    ...DEFAULT_TOOLTIP_CONFIG,
    ...this.tooltip(),
  }));

  // Computed properties
  chartWidth = computed(() => this.width());
  chartHeight = computed(() => this.height());

  // Use responsive service plot dimensions if available, with fallback
  plotWidth = computed(() => {
    if (this.responsiveService) {
      const rpw = this.responsiveService.plotWidth();
      if (rpw > 0) return rpw;
    }
    const m = this.margin();
    return this.width() - m.left - m.right;
  });

  plotHeight = computed(() => {
    if (this.responsiveService) {
      const rph = this.responsiveService.plotHeight();
      if (rph > 0) return rph;
    }
    const m = this.margin();
    return this.height() - m.top - m.bottom;
  });

  /**
   * Band scale for composed charts that contain bars.
   * Null when: not composed, or composed but no bars registered.
   */
  composedBandScale = computed(() => {
    if (this.chartType() !== 'composed') return null;
    if (!this.registryService) return null;

    const hasBars = this.registryService.getItemsByType('bar').length > 0;
    if (!hasBars) return null;

    const data = this.data();
    if (!data.length) return null;

    const categories = this.scaleService.getCategoryDomain(data, this.categoryKey());
    return this.scaleService.createBandScale(categories, [0, this.plotWidth()]);
  });

  constructor() {
    // Push category key to registry for child components
    effect(() => {
      this.registryService?.setCategoryKey(this.categoryKey());
    });

    // Push band scale to registry for child components
    effect(() => {
      const scale = this.composedBandScale();
      this.registryService?.setBandScale(scale);
    });
  }

  // Chart transform using responsive service offset
  chartTransform = computed(() => {
    if (this.responsiveService) {
      const offset = this.responsiveService.totalOffset();
      return `translate(${offset.left}, ${offset.top})`;
    }
    const m = this.margin();
    return `translate(${m.left}, ${m.top})`;
  });

  onMouseMove(event: MouseEvent) {
    // Simple throttling - only process every 16ms (60fps)
    const now = Date.now();
    if (now - this.lastMouseMoveTime < 16) {
      return;
    }
    this.lastMouseMoveTime = now;

    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    // Calculate mouse position relative to plot area
    let offsetLeft = this.margin().left;
    let offsetTop = this.margin().top;

    if (this.responsiveService) {
      const offset = this.responsiveService.totalOffset();
      offsetLeft = offset.left;
      offsetTop = offset.top;
    }

    const x = event.clientX - rect.left - offsetLeft;
    const y = event.clientY - rect.top - offsetTop;

    // Check if mouse is within plot area (grid area)
    const plotWidth = this.plotWidth();
    const plotHeight = this.plotHeight();

    if (x < 0 || x > plotWidth || y < 0 || y > plotHeight) {
      this.currentDataIndex = -1; // Reset index when leaving plot area
      if (this._tooltipService) {
        this._tooltipService.hideTooltip();
      }
      return;
    }

    // Find closest data point
    const data = this.data();
    if (data.length === 0) {
      return;
    }

    // Delegate to strategy if available
    if (this.hitTestStrategy) {
      const result = this.hitTestStrategy.hitTest(
        event.clientX - rect.left,
        event.clientY - rect.top,
        {
          data,
          plotWidth,
          plotHeight,
          offsetLeft,
          offsetTop,
          chartType: this.chartType(),
          registryItems: this.registryService?.visibleItems() ?? [],
        }
      );
      if (result) {
        const item = data[result.dataIndex];
        if (item && this.currentDataIndex !== result.dataIndex) {
          this.currentDataIndex = result.dataIndex;
          const payload = this.generateTooltipPayload(item);
          if (this._tooltipService) {
            this._tooltipService.showTooltip(
              result.coordinate,
              payload,
              result.activeLabel ?? String(item[this.categoryKey()] || '')
            );
          }
        } else if (item) {
          if (this._tooltipService) {
            this._tooltipService.updatePosition(result.coordinate);
          }
        }
      }
      return;
    }

    // Fallback: built-in Cartesian tooltip logic
    const chartType = this.chartType();

    if (chartType === 'bar') {
      this.handleBarTooltip(x, y, data, plotWidth, plotHeight, offsetLeft, offsetTop, event, rect);
    } else if (chartType === 'composed') {
      const hasBars = (this.registryService?.getItemsByType('bar').length ?? 0) > 0;
      if (hasBars) {
        this.handleBarTooltip(x, y, data, plotWidth, plotHeight, offsetLeft, offsetTop, event, rect);
      } else {
        this.handleLineAreaTooltip(x, y, data, plotWidth, plotHeight, offsetLeft, offsetTop, event, rect);
      }
    } else {
      this.handleLineAreaTooltip(x, y, data, plotWidth, plotHeight, offsetLeft, offsetTop, event, rect);
    }
  }
  
  private generateTooltipPayload(item: ChartData): Array<{
    dataKey: string;
    value: number;
    name: string;
    color: string;
    payload: ChartData;
  }> {
    const registeredItems = this.registryService?.visibleItems() ?? [];
    
    if (registeredItems.length > 0) {
      return registeredItems.map(graphicalItem => ({
        dataKey: graphicalItem.dataKey,
        value: getNumericDataValue(item, graphicalItem.dataKey),
        name: graphicalItem.name || graphicalItem.dataKey,
        color: graphicalItem.stroke || graphicalItem.fill || '#8884d8',
        payload: item,
      }));
    }
    
    // Auto-detect: extract all numeric keys from the data item
    const excludeKeys = new Set(['name', 'category', 'label', 'id']);
    const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];
    let colorIndex = 0;

    return Object.entries(item)
      .filter(([key, value]) => !excludeKeys.has(key) && typeof value === 'number')
      .map(([key, value]) => ({
        dataKey: key,
        value: value as number,
        name: key,
        color: defaultColors[colorIndex++ % defaultColors.length],
        payload: item,
      }));
  }

  onMouseLeave(event: MouseEvent) {
    this.currentDataIndex = -1; // Reset data index
    if (this._tooltipService) {
      this._tooltipService.hideTooltip();
    }
  }

  private handleLineAreaTooltip(
    x: number,
    y: number,
    data: ChartData[],
    plotWidth: number,
    plotHeight: number,
    offsetLeft: number,
    offsetTop: number,
    event: MouseEvent,
    rect: DOMRect
  ) {
    const dataIndex = Math.round((x / plotWidth) * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));

    const exactX = (clampedIndex / Math.max(data.length - 1, 1)) * plotWidth;
    const item = data[clampedIndex];
    const payload = this.generateTooltipPayload(item);

    const tooltipY = this.calculateSnapY(y, payload, data, plotHeight, offsetTop, event.clientY - rect.top);
    const tooltipCoord = { x: exactX + offsetLeft, y: tooltipY };

    if (this.currentDataIndex !== clampedIndex) {
      this.currentDataIndex = clampedIndex;
      if (this._tooltipService) {
        this._tooltipService.showTooltip(tooltipCoord, payload, String(item[this.categoryKey()] || ''));
      }
    } else {
      if (this._tooltipService) {
        this._tooltipService.updatePosition({ x: exactX + offsetLeft, y: tooltipY });
      }
    }
  }

  private calculateSnapY(
    y: number,
    payload: Array<{ dataKey: string; value: number; name: string; color: string; payload: ChartData }>,
    data: ChartData[],
    plotHeight: number,
    offsetTop: number,
    rawY: number
  ): number {
    if (!this.tooltipConfig().snapToDataPoint || payload.length === 0) {
      return rawY;
    }

    const allDataKeys = payload.map(p => p.dataKey);
    const maxValue = Math.max(
      ...data.flatMap(d => allDataKeys.map(key => getNumericDataValue(d, key)))
    );

    const yPositions = payload.map(p => ({
      y: plotHeight - (p.value / maxValue) * plotHeight,
      distance: Math.abs(y - (plotHeight - (p.value / maxValue) * plotHeight))
    }));

    const closest = yPositions.reduce((a, b) => a.distance < b.distance ? a : b);
    return closest.y + offsetTop;
  }

  private handleBarTooltip(
    x: number,
    y: number,
    data: ChartData[],
    plotWidth: number,
    plotHeight: number,
    offsetLeft: number,
    offsetTop: number,
    event: MouseEvent,
    rect: DOMRect
  ) {
    const barWidth = plotWidth / data.length;
    const dataIndex = Math.floor(x / barWidth);
    const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));

    const item = data[clampedIndex];
    const payload = this.generateTooltipPayload(item);

    const barCenterX = (dataIndex + 0.5) * barWidth;
    const tooltipY = this.calculateSnapY(y, payload, data, plotHeight, offsetTop, event.clientY - rect.top);
    const tooltipCoord = { x: barCenterX + offsetLeft, y: tooltipY };

    if (this.currentDataIndex !== clampedIndex) {
      this.currentDataIndex = clampedIndex;
      if (this._tooltipService) {
        this._tooltipService.showTooltip(tooltipCoord, payload, String(item[this.categoryKey()] || ''));
      }
    } else {
      if (this._tooltipService) {
        this._tooltipService.updatePosition({ x: barCenterX + offsetLeft, y: tooltipY });
      }
    }
  }

}
