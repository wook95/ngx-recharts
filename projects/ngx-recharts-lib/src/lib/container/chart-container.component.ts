import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { TooltipComponent } from '../component/tooltip.component';
import { DEFAULT_TOOLTIP_CONFIG, TooltipConfig } from '../core/tooltip-types';
import { ChartData, ChartMargin, getNumericDataValue } from '../core/types';
import { ChartLayoutService } from '../services/chart-layout.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipService } from '../services/tooltip.service';
import { SurfaceComponent } from './surface.component';
import { CHART_TOOLTIP_SERVICE } from '../core/chart-context.token';

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
export class ChartContainerComponent implements AfterContentInit {
  private store = inject(Store);
  private layoutService = inject(ChartLayoutService);
  private _tooltipService = inject(TooltipService, { optional: true }) || inject(CHART_TOOLTIP_SERVICE, { optional: true });
  
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
  private currentDataIndex = -1; // Track current data point

  @ContentChild(TooltipComponent) tooltipComponent?: TooltipComponent;

  // Inputs
  data = input.required<ChartData[]>();
  width = input<number>(400);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 5, right: 5, bottom: 5, left: 5 });
  chartType = input<'line' | 'bar' | 'area'>('line');

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

  // Use responsive service plot dimensions if available
  plotWidth = computed(() => {
    if (this.responsiveService) {
      return this.responsiveService.plotWidth();
    }
    const m = this.margin();
    return this.width() - m.left - m.right;
  });

  plotHeight = computed(() => {
    if (this.responsiveService) {
      return this.responsiveService.plotHeight();
    }
    const m = this.margin();
    return this.height() - m.top - m.bottom;
  });

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

    const chartType = this.chartType();

    if (chartType === 'bar') {
      this.handleBarTooltip(
        x,
        y,
        data,
        plotWidth,
        plotHeight,
        offsetLeft,
        offsetTop,
        event,
        rect
      );
    } else {
      this.handleLineAreaTooltip(
        x,
        y,
        data,
        plotWidth,
        plotHeight,
        offsetLeft,
        offsetTop,
        event,
        rect
      );
    }
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
    // Line/Area: snap to X axis data points (shared tooltip)
    const dataIndex = Math.round((x / plotWidth) * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));

    const exactX = (clampedIndex / Math.max(data.length - 1, 1)) * plotWidth;
    const item = data[clampedIndex];
    const payload = [
      {
        dataKey: 'uv',
        value: getNumericDataValue(item, 'uv'),
        name: 'UV',
        color: '#8884d8',
        payload: item,
      },
      {
        dataKey: 'pv',
        value: getNumericDataValue(item, 'pv'),
        name: 'PV',
        color: '#82ca9d',
        payload: item,
      },
    ];

    let tooltipY = event.clientY - rect.top;

    // Snap to closest data point Y coordinate if enabled
    if (this.tooltipConfig().snapToDataPoint) {
      const uvValue = getNumericDataValue(item, 'uv');
      const pvValue = getNumericDataValue(item, 'pv');
      const maxValue = Math.max(
        ...data.map((d) =>
          Math.max(getNumericDataValue(d, 'uv'), getNumericDataValue(d, 'pv'))
        )
      );

      // Calculate Y positions for both data points
      const uvY = plotHeight - (uvValue / maxValue) * plotHeight;
      const pvY = plotHeight - (pvValue / maxValue) * plotHeight;

      // Find which data point is closer to mouse Y
      const mouseRelativeY = y; // y is already relative to plot area
      const uvDistance = Math.abs(mouseRelativeY - uvY);
      const pvDistance = Math.abs(mouseRelativeY - pvY);

      const closestY = uvDistance < pvDistance ? uvY : pvY;
      // Pass exact data point coordinate (offset will be applied in TooltipComponent)
      tooltipY = closestY + offsetTop;
    }

    const tooltipCoord = { x: exactX + offsetLeft, y: tooltipY };

    if (this.currentDataIndex !== clampedIndex) {
      this.currentDataIndex = clampedIndex;
      if (this._tooltipService) {
        this._tooltipService.showTooltip(
          tooltipCoord,
          payload,
          String(item['name'] || '')
        );
      }
    } else {
      if (this._tooltipService) {
        this._tooltipService.updatePosition({
          x: exactX + offsetLeft,
          y: tooltipY,
        });
      }
    }
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
    // Bar: individual bar detection
    const barWidth = plotWidth / data.length;
    const dataIndex = Math.floor(x / barWidth);
    const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));

    const item = data[clampedIndex];
    const payload = [
      {
        dataKey: 'uv',
        value: getNumericDataValue(item, 'uv'),
        name: 'UV',
        color: '#8884d8',
        payload: item,
      },
      {
        dataKey: 'pv',
        value: getNumericDataValue(item, 'pv'),
        name: 'PV',
        color: '#82ca9d',
        payload: item,
      },
    ];

    const barCenterX = (dataIndex + 0.5) * barWidth;
    let tooltipY = event.clientY - rect.top;

    // Snap to closest bar value if enabled
    if (this.tooltipConfig().snapToDataPoint) {
      const uvValue = getNumericDataValue(item, 'uv');
      const pvValue = getNumericDataValue(item, 'pv');
      const maxValue = Math.max(
        ...data.map((d) =>
          Math.max(getNumericDataValue(d, 'uv'), getNumericDataValue(d, 'pv'))
        )
      );

      // Calculate Y positions for both bar values
      const uvY = plotHeight - (uvValue / maxValue) * plotHeight;
      const pvY = plotHeight - (pvValue / maxValue) * plotHeight;

      // Find which bar value is closer to mouse Y
      const mouseRelativeY = y; // y is already relative to plot area
      const uvDistance = Math.abs(mouseRelativeY - uvY);
      const pvDistance = Math.abs(mouseRelativeY - pvY);

      const closestY = uvDistance < pvDistance ? uvY : pvY;
      // Pass exact data point coordinate (offset will be applied in TooltipComponent)
      tooltipY = closestY + offsetTop;
    }

    const tooltipCoord = { x: barCenterX + offsetLeft, y: tooltipY };

    if (this.currentDataIndex !== clampedIndex) {
      this.currentDataIndex = clampedIndex;
      if (this._tooltipService) {
        this._tooltipService.showTooltip(
          tooltipCoord,
          payload,
          String(item['name'] || '')
        );
      }
    } else {
      if (this._tooltipService) {
        this._tooltipService.updatePosition({
          x: barCenterX + offsetLeft,
          y: tooltipY,
        });
      }
    }
  }

  ngAfterContentInit() {
    // Connect tooltip component with service if present
    if (this.tooltipComponent) {
      console.log('🔗 Tooltip component detected and connected');
    } else {
      console.log('⚠️ No tooltip component found in ng-content');
    }

    // Debug tooltip service state
    if (this._tooltipService) {
      console.log('🔧 TooltipService state:', {
        active: this._tooltipService.active(),
        payload: this._tooltipService.payload(),
        coordinate: this._tooltipService.coordinate(),
      });
    } else {
      console.log('❌ TooltipService not available');
    }
  }
}
