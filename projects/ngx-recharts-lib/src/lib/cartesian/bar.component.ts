import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { ChartData, getNumericDataValue } from '../core/types';
import { ScaleService } from '../services/scale.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { createChartDimensions } from '../shared/chart-dimensions';
import { ChartDataService } from '../services/chart-data.service';

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
  template: `
    @if (!hide() && bars().length > 0) {
      @for (bar of bars(); track $index) {
        <svg:rect
          class="recharts-bar-rectangle"
          [attr.x]="bar.x"
          [attr.y]="bar.y"
          [attr.width]="bar.width"
          [attr.height]="bar.height"
          [attr.fill]="fill()"
          [attr.stroke]="stroke()"
          [attr.stroke-width]="strokeWidth()" />
      }
    }
  `
})
export class BarComponent implements OnDestroy {
  private scaleService = inject(ScaleService);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private registryService = inject(GraphicalItemRegistryService, { optional: true });
  private chartDataService = inject(ChartDataService, { optional: true });

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
  
  // Chart dimensions
  chartWidth = input<number>(400);
  chartHeight = input<number>(300);
  margin = input<{top: number, right: number, bottom: number, left: number}>({
    top: 20, right: 30, bottom: 40, left: 40
  });

  // Shared dimension logic
  private dims = createChartDimensions(
    this.responsiveService, this.chartWidth, this.chartHeight, this.margin
  );
  
  resolvedData = computed(() => {
    const explicit = this.data();
    return explicit.length > 0 ? explicit : (this.chartDataService?.data() ?? []);
  });

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

      return data.map((item) => {
        const value = getNumericDataValue(item, dataKey);
        const categoryValue = String(item[ck] || '');

        const bandX = xScale(categoryValue) || 0;
        const fullBandWidth = xScale.bandwidth();

        // Calculate grouped bar positioning
        const singleBarWidth = fullBandWidth / totalBars;
        const x = bandX + barIndex * singleBarWidth;
        const width = singleBarWidth;

        const zeroY = yScale(0);
        const barY = yScale(value);
        const y = Math.min(barY, zeroY);
        const height = Math.abs(barY - zeroY);

        return {
          x: Number(x.toFixed(1)),
          y: Number(y.toFixed(1)),
          width: Number(width.toFixed(1)),
          height: Number(height.toFixed(1)),
          value,
          payload: item,
        };
      });
    }
  });
}