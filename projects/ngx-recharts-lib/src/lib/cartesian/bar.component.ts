import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
} from '@angular/core';
import { ChartData, getNumericDataValue } from '../core/types';
import { ChartMouseEvent } from '../core/event-types';
import { ScaleService } from '../services/scale.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { createChartDimensions } from '../shared/chart-dimensions';
import { ChartDataService } from '../services/chart-data.service';
import { ClipPathService } from '../services/clip-path.service';
import { stack as d3Stack } from 'd3-shape';
import { getD3StackOffset } from '../shared/d3-helpers';

export interface BarRect {
  x: number;
  y: number;
  width: number;
  height: number;
  value: any;
  payload: ChartData;
}

@Component({
  selector: 'svg:g[ngx-bar]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.clip-path]': 'clipPathService?.shouldClip() ? clipPathService.clipPathUrl() : null',
  },
  template: `
    @if (!hide() && bars().length > 0) {
      @for (bar of bars(); track $index) {
        @if (background()) {
          <svg:rect
            class="recharts-bar-background-rectangle"
            [attr.x]="bar.x"
            [attr.y]="0"
            [attr.width]="bar.width"
            [attr.height]="dims.plotArea().height"
            [attr.fill]="'#eee'"
            [attr.opacity]="0.5" />
        }
        <svg:rect
          class="recharts-bar-rectangle"
          [attr.x]="bar.x"
          [attr.y]="bar.y"
          [attr.width]="bar.width"
          [attr.height]="bar.height"
          [attr.fill]="fill()"
          [attr.stroke]="stroke()"
          [attr.stroke-width]="strokeWidth()"
          [attr.rx]="resolvedRadius()"
          [attr.ry]="resolvedRadius()"
          [style.transition]="isAnimationActive() ? 'all ' + animationDuration() + 'ms ' + animationEasing() + ' ' + animationBegin() + 'ms' : null"
          (click)="handleBarClick($event, bar.payload, $index)"
          (mouseenter)="handleBarMouseEnter($event, bar.payload, $index)"
          (mouseleave)="handleBarMouseLeave($event, bar.payload, $index)" />
        @if (label()) {
          <svg:text
            class="recharts-bar-label"
            [attr.x]="bar.x + bar.width / 2"
            [attr.y]="bar.y - 4"
            [attr.text-anchor]="'middle'"
            [attr.font-size]="'12'"
            [attr.fill]="'#666'">{{ bar.value }}</svg:text>
        }
      }
    }
  `
})
export class BarComponent implements OnDestroy {
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private registryService = inject(GraphicalItemRegistryService, { optional: true });
  private chartDataService = inject(ChartDataService, { optional: true });
  clipPathService = inject(ClipPathService, { optional: true });

  private static nextId = 0;
  private readonly itemId = `bar-${BarComponent.nextId++}`;

  constructor() {
    effect(() => {
      this.registryService?.replace(this.itemId, {
        id: this.itemId,
        type: 'bar',
        dataKey: this.dataKey(),
        name: this.name()?.toString(),
        fill: this.fill(),
        stroke: this.stroke(),
        xAxisId: this.xAxisId(),
        yAxisId: this.yAxisId(),
        hide: this.hide(),
        stackId: this.stackId(),
      });
    });
  }

  ngOnDestroy(): void {
    this.registryService?.unregister(this.itemId);
  }

  dataKey = input.required<string>();
  data = input<ChartData[]>([]);
  fill = input<string>('#8884d8');
  stroke = input<string>('none');
  strokeWidth = input<number>(0);
  hide = input<boolean>(false);
  name = input<string | number | undefined>(undefined);
  xAxisId = input<string | number>(0);
  yAxisId = input<string | number>(0);
  stackId = input<string | undefined>(undefined);
  categoryKey = input<string>('name');

  // New inputs
  barSize = input<number | undefined>(undefined);
  maxBarSize = input<number | undefined>(undefined);
  minPointSize = input<number>(0);
  background = input<boolean | Record<string, any>>(false);
  radius = input<number | [number, number, number, number]>(0);
  label = input<boolean | Record<string, any>>(false);
  legendType = input<string>('rect');
  unit = input<string>('');
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(400);
  animationEasing = input<string>('ease');
  activeBar = input<boolean | Record<string, any>>(false);
  activeIndex = input<number>(-1);

  barClick = output<ChartMouseEvent>();
  barMouseEnter = output<ChartMouseEvent>();
  barMouseLeave = output<ChartMouseEvent>();

  // Chart dimensions
  chartWidth = input<number>(400);
  chartHeight = input<number>(300);
  margin = input<{top: number, right: number, bottom: number, left: number}>({
    top: 20, right: 30, bottom: 40, left: 40
  });

  // Shared dimension logic
  dims = createChartDimensions(
    this.responsiveService, this.chartWidth, this.chartHeight, this.margin
  );

  // Resolve radius to a single number for SVG rx/ry
  resolvedRadius = computed(() => {
    const r = this.radius();
    if (Array.isArray(r)) {
      return r[0];
    }
    return r;
  });

  resolvedData = computed(() => {
    const explicit = this.data();
    return explicit.length > 0 ? explicit : (this.chartDataService?.data() ?? []);
  });

  handleBarClick(event: MouseEvent, data: any, index: number) {
    this.barClick.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: data,
      index,
      value: data?.[this.dataKey() as string],
    });
  }

  handleBarMouseEnter(event: MouseEvent, data: any, index: number) {
    this.barMouseEnter.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: data,
      index,
      value: data?.[this.dataKey() as string],
    });
  }

  handleBarMouseLeave(event: MouseEvent, data: any, index: number) {
    this.barMouseLeave.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: data,
      index,
      value: data?.[this.dataKey() as string],
    });
  }

  // Computed properties
  bars = computed(() => {
    const data = this.resolvedData();
    const dataKey = this.dataKey();
    const plotArea = this.dims.plotArea();

    if (!data.length || plotArea.width <= 0 || plotArea.height <= 0) return [];

    // Create scales using D3
    const ck = this.registryService?.categoryKey() ?? this.categoryKey();
    const xDomain = this.scaleService.getCategoryDomain(data, ck);
    const yDomain = this.chartDataService?.unifiedYDomain()
      ?? this.scaleService.getLinearDomain(data, dataKey);

    const xScale = this.scaleService.createBandScale(xDomain, [0, plotArea.width]);
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);

    const myStackId = this.stackId();

    if (myStackId) {
      // STACKED: bars share the same x position, stack vertically
      const stackedBars = this.registryService?.getItemsByType('bar')
        .filter(item => !item.hide && item.stackId === myStackId) ?? [];
      const myStackIndex = stackedBars.findIndex(item => item.id === this.itemId);
      const resolvedIndex = myStackIndex === -1 ? 0 : myStackIndex;

      const currentStackOffset = this.chartDataService?.stackOffset() ?? 'none';

      if (currentStackOffset !== 'none') {
        // Use d3 stack() for non-default offset modes
        const stackKeys = stackedBars.map(b => b.dataKey);
        const d3OffsetFn = getD3StackOffset(currentStackOffset);

        const stackGenerator = d3Stack<ChartData>()
          .keys(stackKeys)
          .value((d, key) => getNumericDataValue(d, key))
          .offset(d3OffsetFn);

        const stackedSeries = stackGenerator(data);
        const mySeries = stackedSeries[resolvedIndex];

        if (!mySeries) return [];

        // For 'expand' the domain is [0, 1]; for others, derive from stacked data
        let stackMin = Infinity;
        let stackMax = -Infinity;
        for (const series of stackedSeries) {
          for (const point of series) {
            if (point[0] < stackMin) stackMin = point[0];
            if (point[1] > stackMax) stackMax = point[1];
          }
        }
        const stackYScale = this.scaleService.createLinearScale(
          [Math.min(0, stackMin), stackMax],
          [plotArea.height, 0]
        );

        return data.map((item, i) => {
          const categoryValue = String(item[ck] || '');
          const bandX = xScale(categoryValue) || 0;
          const width = xScale.bandwidth();

          const [y0, y1] = mySeries[i];
          const topY = stackYScale(y1);
          const baseY = stackYScale(y0);
          const y = Math.min(baseY, topY);
          const height = Math.abs(baseY - topY);

          return {
            x: Number(bandX.toFixed(1)),
            y: Number(y.toFixed(1)),
            width: Number(width.toFixed(1)),
            height: Number(height.toFixed(1)),
            value: getNumericDataValue(item, dataKey),
            payload: item,
          };
        });
      }

      // Default 'none' offset: manual accumulation (preserves existing behavior)
      return data.map((item) => {
        const value = getNumericDataValue(item, dataKey);
        const categoryValue = String(item[ck] || '');

        const bandX = xScale(categoryValue) || 0;
        const width = xScale.bandwidth();

        // Sum values of preceding bars in the stack
        let baseValue = 0;
        for (let i = 0; i < resolvedIndex; i++) {
          const prevDataKey = stackedBars[i].dataKey;
          baseValue += getNumericDataValue(item, prevDataKey);
        }

        const baseY = yScale(baseValue);
        const topY = yScale(baseValue + value);
        const y = Math.min(baseY, topY);
        const height = Math.abs(baseY - topY);

        return {
          x: Number(bandX.toFixed(1)),
          y: Number(y.toFixed(1)),
          width: Number(width.toFixed(1)),
          height: Number(height.toFixed(1)),
          value,
          payload: item,
        };
      });
    } else {
      // GROUPED: side-by-side bars
      let barIndex = 0;
      let totalBars = 1;

      if (this.registryService) {
        const allBars = this.registryService.getItemsByType('bar')
          .filter(item => !item.hide && !item.stackId);
        totalBars = Math.max(allBars.length, 1);
        barIndex = allBars.findIndex(item => item.id === this.itemId);
        if (barIndex === -1) barIndex = 0; // fallback if not yet registered
      }

      // Resolve chart-level or component-level barSize
      const chartBarSize = this.chartDataService?.barSize();
      const componentBarSize = this.barSize();
      const resolvedBarSize = chartBarSize ?? componentBarSize;

      // Resolve barGap: chart-level takes precedence over default
      const chartBarGap = this.chartDataService?.barGap() ?? 4;

      // Resolve barCategoryGap: chart-level takes precedence over default
      const chartBarCategoryGap = this.chartDataService?.barCategoryGap() ?? '10%';

      return data.map((item) => {
        const value = getNumericDataValue(item, dataKey);
        const categoryValue = String(item[ck] || '');

        const bandX = xScale(categoryValue) || 0;
        const fullBandWidth = xScale.bandwidth();

        // Apply category gap to shrink available width per category
        let categoryGapPx: number;
        if (typeof chartBarCategoryGap === 'string' && chartBarCategoryGap.endsWith('%')) {
          const pct = parseFloat(chartBarCategoryGap) / 100;
          categoryGapPx = fullBandWidth * pct;
        } else {
          categoryGapPx = Number(chartBarCategoryGap);
        }
        const availableWidth = fullBandWidth - categoryGapPx;

        // Calculate grouped bar positioning
        let singleBarWidth: number;
        let groupOffset: number;

        if (resolvedBarSize !== undefined) {
          // Fixed bar size: use it directly, center the group
          singleBarWidth = resolvedBarSize;
          const totalGroupWidth = totalBars * resolvedBarSize + (totalBars - 1) * chartBarGap;
          const groupStart = bandX + (fullBandWidth - totalGroupWidth) / 2;
          const x = groupStart + barIndex * (resolvedBarSize + chartBarGap);

          const zeroY = yScale(0);
          const barY = yScale(value);
          const y = Math.min(barY, zeroY);
          const height = Math.abs(barY - zeroY);

          return {
            x: Number(x.toFixed(1)),
            y: Number(y.toFixed(1)),
            width: Number(singleBarWidth.toFixed(1)),
            height: Number(height.toFixed(1)),
            value,
            payload: item,
          };
        }

        // Auto-calculated bar width with barGap between grouped bars
        if (totalBars > 1) {
          const totalGap = (totalBars - 1) * chartBarGap;
          singleBarWidth = (availableWidth - totalGap) / totalBars;
          groupOffset = (fullBandWidth - availableWidth) / 2;
        } else {
          singleBarWidth = availableWidth;
          groupOffset = (fullBandWidth - availableWidth) / 2;
        }

        const x = bandX + groupOffset + barIndex * (singleBarWidth + chartBarGap);

        const zeroY = yScale(0);
        const barY = yScale(value);
        const y = Math.min(barY, zeroY);
        const height = Math.abs(barY - zeroY);

        return {
          x: Number(x.toFixed(1)),
          y: Number(y.toFixed(1)),
          width: Number(singleBarWidth.toFixed(1)),
          height: Number(height.toFixed(1)),
          value,
          payload: item,
        };
      });
    }
  });
}
