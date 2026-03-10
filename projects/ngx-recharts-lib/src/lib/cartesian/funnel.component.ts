import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  OnDestroy,
  output,
} from '@angular/core';
import { ChartMouseEvent } from '../core/event-types';
import { ChartDataService } from '../services/chart-data.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { createChartDimensions } from '../shared/chart-dimensions';
import { TrapezoidComponent } from '../shape/trapezoid.component';
import { RectangleComponent } from '../shape/rectangle.component';
import { CellComponent } from '../component/cell.component';

export interface FunnelSegment {
  x: number;
  y: number;
  upperWidth: number;
  lowerWidth: number;
  height: number;
  fill: string;
  value: number;
  name: string;
}

@Component({
  selector: 'svg:g[ngx-funnel]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TrapezoidComponent, RectangleComponent],
  template: `
    @if (!hide()) {
      @for (segment of segments(); track $index) {
        @if ($last && lastShapeType() === 'rectangle') {
          <svg:g
            (click)="handleFunnelClick($event, segment, $index)"
            (mouseenter)="handleFunnelMouseEnter($event, segment, $index)"
            (mouseleave)="handleFunnelMouseLeave($event, segment, $index)"
          >
            <svg:g ngx-rectangle [x]="segment.x" [y]="segment.y" [width]="segment.lowerWidth" [height]="segment.height" [fill]="segment.fill" [stroke]="stroke()" [isAnimationActive]="isAnimationActive()" [animationBegin]="animationBegin()" [animationDuration]="animationDuration()" [animationEasing]="animationEasing()" />
          </svg:g>
        } @else {
          <svg:g
            (click)="handleFunnelClick($event, segment, $index)"
            (mouseenter)="handleFunnelMouseEnter($event, segment, $index)"
            (mouseleave)="handleFunnelMouseLeave($event, segment, $index)"
          >
            <svg:g ngx-trapezoid [x]="segment.x" [y]="segment.y" [upperWidth]="segment.upperWidth" [lowerWidth]="segment.lowerWidth" [height]="segment.height" [fill]="segment.fill" [stroke]="stroke()" [isAnimationActive]="isAnimationActive()" [animationBegin]="animationBegin()" [animationDuration]="animationDuration()" [animationEasing]="animationEasing()" />
          </svg:g>
        }
      }
    }
  `,
})
export class FunnelComponent implements OnDestroy {
  private chartDataService = inject(ChartDataService, { optional: true });
  private registryService = inject(GraphicalItemRegistryService, { optional: true });
  private responsiveService = inject(ResponsiveContainerService, { optional: true });

  private static nextId = 0;
  private readonly itemId = `funnel-${FunnelComponent.nextId++}`;

  // Inputs
  data = input<any[]>([]);
  dataKey = input.required<string>();
  nameKey = input<string>('name');
  fill = input<string>('#8884d8');
  stroke = input<string>('#fff');
  legendType = input<string>('rect');
  label = input<boolean>(false);
  lastShapeType = input<'rectangle' | 'trapezoid'>('rectangle');
  hide = input<boolean>(false);
  name = input<string>('');

  // Animation inputs
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(300);
  animationEasing = input<string>('ease');

  // Event outputs
  funnelClick = output<ChartMouseEvent>();
  funnelMouseEnter = output<ChartMouseEvent>();
  funnelMouseLeave = output<ChartMouseEvent>();

  handleFunnelClick(event: MouseEvent, segment: FunnelSegment, index: number) {
    this.funnelClick.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: segment,
      index,
      value: segment.value,
    });
  }

  handleFunnelMouseEnter(event: MouseEvent, segment: FunnelSegment, index: number) {
    this.funnelMouseEnter.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: segment,
      index,
      value: segment.value,
    });
  }

  handleFunnelMouseLeave(event: MouseEvent, segment: FunnelSegment, index: number) {
    this.funnelMouseLeave.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: segment,
      index,
      value: segment.value,
    });
  }

  // Chart dimensions (for plot area calculation)
  chartWidth = input<number>(400);
  chartHeight = input<number>(300);
  margin = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 20, right: 30, bottom: 20, left: 30,
  });

  // Cell children for per-segment fill overrides
  cells = contentChildren(CellComponent);

  private dims = createChartDimensions(
    this.responsiveService,
    this.chartWidth,
    this.chartHeight,
    this.margin,
  );

  constructor() {
    effect(() => {
      this.registryService?.replace(this.itemId, {
        id: this.itemId,
        type: 'funnel',
        dataKey: this.dataKey(),
        name: this.name() || this.dataKey(),
        fill: this.fill(),
        hide: this.hide(),
      });
    });
  }

  ngOnDestroy(): void {
    this.registryService?.unregister(this.itemId);
  }

  resolvedData = computed(() => {
    const explicit = this.data();
    return explicit.length > 0 ? explicit : (this.chartDataService?.data() ?? []);
  });

  segments = computed((): FunnelSegment[] => {
    const rawData = this.resolvedData();
    const dataKey = this.dataKey();
    const nameKey = this.nameKey();
    const plotArea = this.dims.plotArea();
    const defaultFill = this.fill();
    const cells = this.cells();

    if (!rawData.length || plotArea.width <= 0 || plotArea.height <= 0) return [];

    // Sort descending by value (largest on top)
    const sorted = [...rawData].sort((a, b) => {
      const aVal = Number(a[dataKey] ?? 0);
      const bVal = Number(b[dataKey] ?? 0);
      return bVal - aVal;
    });

    const maxValue = Number(sorted[0][dataKey] ?? 0);
    if (maxValue <= 0) return [];

    const count = sorted.length;
    const segmentHeight = plotArea.height / count;
    const plotWidth = plotArea.width;

    return sorted.map((item, index) => {
      const value = Number(item[dataKey] ?? 0);
      const nextValue = index + 1 < count ? Number(sorted[index + 1][dataKey] ?? 0) : value;

      const upperWidth = (value / maxValue) * plotWidth;
      const lowerWidth = (nextValue / maxValue) * plotWidth;

      // Center-align on the top edge (Recharts-compatible): x anchors upperWidth
      const x = (plotWidth - upperWidth) / 2;
      const y = index * segmentHeight;

      // Per-cell fill override
      const cellFill = cells[index]?.fill();
      const segFill = cellFill ?? defaultFill;

      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        upperWidth: Number(upperWidth.toFixed(1)),
        lowerWidth: Number(lowerWidth.toFixed(1)),
        height: Number(segmentHeight.toFixed(1)),
        fill: segFill,
        value,
        name: String(item[nameKey] ?? ''),
      };
    });
  });
}
