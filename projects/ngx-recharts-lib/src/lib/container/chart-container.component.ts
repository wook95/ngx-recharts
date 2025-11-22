import {
  ChangeDetectionStrategy,
  Component,
  computed, 
  effect,
  ElementRef,
  inject,
  Injectable,
  input,
  signal
} from '@angular/core';
import { Store } from '@ngrx/store';
import { TooltipComponent } from '../component/tooltip.component';
import { DEFAULT_TOOLTIP_CONFIG, TooltipConfig } from '../core/tooltip-types';
import { ChartData, ChartMargin, getNumericDataValue } from '../core/types';

import { CHART_LAYOUT } from '../context/chart-layout.context';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipService } from '../services/tooltip.service';
import { TooltipConfigService } from '../services/tooltip-config.service';
import { SurfaceComponent } from './surface.component';

@Injectable()
export class ChartContainerService {
  private _plotWidth = signal(0);
  private _plotHeight = signal(0);
  
  plotWidth = this._plotWidth.asReadonly();
  plotHeight = this._plotHeight.asReadonly();
  
  setPlotDimensions(width: number, height: number) {
    this._plotWidth.set(width);
    this._plotHeight.set(height);
  }
}



@Component({
  selector: 'ngx-chart-container',
  standalone: true,
  imports: [SurfaceComponent, TooltipComponent],
  providers: [ChartContainerService],
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
            stroke="transparent"
          />
          <ng-content></ng-content>
        </svg:g>
      </ngx-recharts-surface>

      <!-- Tooltip with service binding -->
      <div class="tooltip-container">
        @if (hasTooltipService) {
          <ngx-tooltip
            [active]="tooltipActive()"
            [payload]="tooltipPayload()"
            [label]="tooltipLabel()"
            [coordinate]="tooltipCoordinate()"
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
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .recharts-wrapper {
        position: relative;
        cursor: default;
        user-select: none;
        width: 100%;
        height: 100%;
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
  private store = inject(Store);
  private chartLayoutContext = inject(CHART_LAYOUT);
  private _tooltipService = inject(TooltipService, { optional: true });
  private _tooltipConfigService = inject(TooltipConfigService, { optional: true });
  private chartContainerService = inject(ChartContainerService);




  // Service instance check (not reactive, so simple getter is fine)
  get hasTooltipService(): boolean {
    return !!this._tooltipService;
  }

  // Computed properties for reactive tooltip state
  tooltipActive = computed(() => this._tooltipService?.active() || false);
  tooltipPayload = computed(() => this._tooltipService?.payload() || []);
  tooltipLabel = computed(() => this._tooltipService?.label() || '');
  tooltipCoordinate = computed(() => this._tooltipService?.coordinate() || { x: 0, y: 0 });
  private elementRef = inject(ElementRef);
  private responsiveService = inject(ResponsiveContainerService, {
    optional: true,
  });
  private lastMouseMoveTime = 0;
  private currentDataIndex = -1; // Track current data point

  // Inputs
  data = input.required<ChartData[]>();
  width = input<number>(400);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 5, right: 5, bottom: 5, left: 5 });
  chartType = input<'line' | 'bar' | 'area' | 'composed'>('line');
  
  // ComposedChart specific inputs
  layout = input<'horizontal' | 'vertical'>('horizontal');
  barCategoryGap = input<string | number>('10%');
  barGap = input<number>(4);
  barSize = input<number | undefined>(undefined);
  reverseStackOrder = input<boolean>(false);
  baseValue = input<number | 'dataMin' | 'dataMax' | 'auto'>('auto');

  // Tooltip configuration (recharts API)
  tooltip = input<TooltipConfig>({});

  // Merged tooltip configuration with defaults
  tooltipConfig = computed(() => {
    const serviceConfig = this._tooltipConfigService?.config() || {};

    const m = this.margin();
    const offsetLeft = m.left;
    const offsetTop = m.top;

    const config = {
      ...DEFAULT_TOOLTIP_CONFIG,
      ...this.tooltip(),
      ...serviceConfig,
      // Add viewBox for proper floating-ui positioning
      viewBox: {
        x: offsetLeft,
        y: offsetTop,
        width: this.plotWidth(),
        height: this.plotHeight()
      }
    };

    return config;
  });

  // Computed properties - use ResponsiveContainer context if available
  chartWidth = computed(() => {
    if (this.responsiveService) {
      const width = this.responsiveService.width();
      // Use ResponsiveContainer size if it's valid (> 10 to avoid tiny sizes)
      const result = width > 10 ? width : this.width();

      return result;
    }
    return this.width();
  });

  chartHeight = computed(() => {
    if (this.responsiveService) {
      const height = this.responsiveService.height();
      // Use ResponsiveContainer size if it's valid (> 10 to avoid tiny sizes)
      const result = height > 10 ? height : this.height();

      return result;
    }
    return this.height();
  });

  plotWidth = computed(() => {
    if (this.responsiveService) {
      const offset = this.responsiveService.totalOffset();
      const result = this.chartWidth() - offset.left - offset.right;
      return Math.max(0, result);
    }
    const m = this.margin();
    const result = this.chartWidth() - m.left - m.right;
    return result;
  });

  plotHeight = computed(() => {
    if (this.responsiveService) {
      const offset = this.responsiveService.totalOffset();
      const result = this.chartHeight() - offset.top - offset.bottom;
      return Math.max(0, result);
    }
    const m = this.margin();
    const result = this.chartHeight() - m.top - m.bottom;
    return result;
  });

  // Effect to update service when dimensions change
  private updateServiceEffect = effect(() => {
    const width = this.chartWidth();
    const height = this.chartHeight();
    const plotWidth = this.plotWidth();
    const plotHeight = this.plotHeight();
    const margin = this.margin();
    
    // Sync margin to responsive service
    if (this.responsiveService) {
      this.responsiveService.setMargin(margin);
    }
    
    // Update local container service
    this.chartContainerService.setPlotDimensions(plotWidth, plotHeight);
    
    // Update shared layout context
    this.chartLayoutContext.setDimensions(width, height);
    this.chartLayoutContext.setPlotDimensions(plotWidth, plotHeight);
  });



  // Chart transform using margin
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
    const m = this.margin();
    const offsetLeft = m.left;
    const offsetTop = m.top;

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
    
    // For ComposedChart, include all data keys
    const chartType = this.chartType();
    let payload: any[];
    
    if (chartType === 'composed') {
      payload = [
        {
          dataKey: 'amt',
          value: getNumericDataValue(item, 'amt'),
          name: 'Amount',
          color: '#ffc658',
          payload: item,
        },
        {
          dataKey: 'pv',
          value: getNumericDataValue(item, 'pv'),
          name: 'PV',
          color: '#82ca9d',
          payload: item,
        },
        {
          dataKey: 'uv',
          value: getNumericDataValue(item, 'uv'),
          name: 'UV',
          color: '#8884d8',
          payload: item,
        },
      ];
    } else {
      payload = [
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
    }

    let tooltipY = event.clientY - rect.top;

    // Snap to closest data point Y coordinate if enabled
    if (this.tooltipConfig().snapToDataPoint) {
      // Calculate max value from all numeric data for proper scaling
      const allValues = data.flatMap(d => 
        Object.values(d).filter(v => typeof v === 'number') as number[]
      );
      const maxValue = Math.max(...allValues);

      // Calculate Y positions for data points
      const dataValues = payload.map(p => p.value);
      const dataYPositions = dataValues.map(value => 
        plotHeight - (value / maxValue) * plotHeight
      );

      // Find which data point is closer to mouse Y
      const mouseRelativeY = y;
      const distances = dataYPositions.map(yPos => Math.abs(mouseRelativeY - yPos));
      const closestIndex = distances.indexOf(Math.min(...distances));
      const closestY = dataYPositions[closestIndex];
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
      const mouseRelativeY = y;
      const uvDistance = Math.abs(mouseRelativeY - uvY);
      const pvDistance = Math.abs(mouseRelativeY - pvY);

      const closestY = uvDistance < pvDistance ? uvY : pvY;
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

}
