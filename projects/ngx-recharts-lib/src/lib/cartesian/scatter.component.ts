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
import { ChartMouseEvent } from '../core/event-types';
import { AxisRegistryService } from '../services/axis-registry.service';
import { ChartDataService } from '../services/chart-data.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { ScaleService } from '../services/scale.service';
import { createChartDimensions } from '../shared/chart-dimensions';
import { ClipPathService } from '../services/clip-path.service';
import { SymbolsComponent, SymbolType } from '../shape/symbols.component';
import { CurveComponent, CurveType } from '../shape/curve.component';

export interface ScatterPoint {
  x: number;
  y: number;
  size?: number;
  payload: any;
}

@Component({
  selector: 'svg:g[ngx-scatter]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SymbolsComponent, CurveComponent],
  host: {
    '[attr.clip-path]': 'clipPathService?.shouldClip() ? clipPathService.clipPathUrl() : null',
  },
  template: `
    @if (!hide()) {
      @if (line()) {
        <svg:g ngx-curve [points]="scatterPoints()" [type]="lineJointType()" [stroke]="stroke()" [fill]="'none'" />
      }
      @for (point of scatterPoints(); track $index) {
        <svg:g ngx-symbols
          [type]="shape()"
          [cx]="point.x"
          [cy]="point.y"
          [size]="point.size || 64"
          [fill]="fill()"
          [stroke]="stroke()"
          [isAnimationActive]="isAnimationActive()"
          [animationBegin]="animationBegin()"
          [animationDuration]="animationDuration()"
          [animationEasing]="animationEasing()"
          (symbolClick)="handleScatterClick($event, point, $index)"
          (symbolMouseEnter)="handleScatterMouseEnter($event, point, $index)"
          (symbolMouseLeave)="handleScatterMouseLeave($event, point, $index)"
        />
      }
    }
  `,
})
export class ScatterComponent implements OnDestroy {
  private axisRegistry = inject(AxisRegistryService, { optional: true });
  private chartDataService = inject(ChartDataService, { optional: true });
  private registryService = inject(GraphicalItemRegistryService, { optional: true });
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private scaleService = inject(ScaleService);
  clipPathService = inject(ClipPathService, { optional: true });

  private static nextId = 0;
  private readonly itemId = `scatter-${ScatterComponent.nextId++}`;

  // Inputs
  data = input<any[]>([]);
  dataKey = input<string | { x: string; y: string; z?: string }>('');
  xAxisId = input<string>('0');
  yAxisId = input<string>('0');
  zAxisId = input<string>('0');
  line = input<boolean>(false);
  lineType = input<string>('joint');
  lineJointType = input<CurveType>('linear');
  shape = input<SymbolType>('circle');
  legendType = input<string>('circle');
  fill = input<string>('#8884d8');
  stroke = input<string>('#8884d8');
  name = input<string>('');
  hide = input<boolean>(false);

  // Animation inputs
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(300);
  animationEasing = input<string>('ease');

  // Event outputs
  scatterClick = output<ChartMouseEvent>();
  scatterMouseEnter = output<ChartMouseEvent>();
  scatterMouseLeave = output<ChartMouseEvent>();

  // Chart dimensions (for standalone use)
  chartWidth = input<number>(400);
  chartHeight = input<number>(300);
  margin = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 20,
    right: 30,
    bottom: 40,
    left: 40,
  });

  private dims = createChartDimensions(
    this.responsiveService,
    this.chartWidth,
    this.chartHeight,
    this.margin
  );

  plotArea = this.dims.plotArea;

  constructor() {
    effect(() => {
      const dk = this.dataKey();
      const dataKeyStr = typeof dk === 'string' ? dk : `${dk.x}/${dk.y}`;
      this.registryService?.replace(this.itemId, {
        id: this.itemId,
        type: 'scatter',
        dataKey: dataKeyStr,
        name: this.name(),
        fill: this.fill(),
        stroke: this.stroke(),
        xAxisId: this.xAxisId(),
        yAxisId: this.yAxisId(),
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

  handleScatterClick(event: MouseEvent, point: ScatterPoint, index: number) {
    this.scatterClick.emit({
      nativeEvent: event,
      payload: point.payload,
      index,
      value: point.payload,
      coordinate: { x: point.x, y: point.y },
    });
  }

  handleScatterMouseEnter(event: MouseEvent, point: ScatterPoint, index: number) {
    this.scatterMouseEnter.emit({
      nativeEvent: event,
      payload: point.payload,
      index,
      value: point.payload,
      coordinate: { x: point.x, y: point.y },
    });
  }

  handleScatterMouseLeave(event: MouseEvent, point: ScatterPoint, index: number) {
    this.scatterMouseLeave.emit({
      nativeEvent: event,
      payload: point.payload,
      index,
      value: point.payload,
      coordinate: { x: point.x, y: point.y },
    });
  }

  scatterPoints = computed((): ScatterPoint[] => {
    const data = this.resolvedData();
    const dk = this.dataKey();
    const plotArea = this.plotArea();

    if (!data.length || plotArea.width <= 0 || plotArea.height <= 0) return [];

    // Determine x/y/z keys
    const xKey = typeof dk === 'string' ? 'x' : dk.x;
    const yKey = typeof dk === 'string' ? 'y' : dk.y;
    const zKey = typeof dk !== 'string' ? dk.z : undefined;

    // Compute x domain and scale (include 0 to match axis behavior)
    const xValues = data.map(d => Number(d[xKey] ?? 0));
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const xDomainMin = xMin > 0 ? 0 : xMin;
    const xDomainMax = xMax < 0 ? 0 : (xMax === xDomainMin ? xDomainMin + 1 : xMax);
    const xDomain: [number, number] = [xDomainMin, xDomainMax];
    const xScale = this.scaleService.createLinearScale(xDomain, [0, plotArea.width]);

    // Compute y domain and scale (include 0 to match axis behavior)
    const yValues = data.map(d => Number(d[yKey] ?? 0));
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yDomainMin = yMin > 0 ? 0 : yMin;
    const yDomainMax = yMax < 0 ? 0 : (yMax === yDomainMin ? yDomainMin + 1 : yMax);
    const yDomain: [number, number] = [yDomainMin, yDomainMax];
    const yScale = this.scaleService.createLinearScale(yDomain, [plotArea.height, 0]);

    // Get z-axis scale if available
    const zAxisReg = this.axisRegistry?.getZAxis(this.zAxisId());
    const zScale = zAxisReg?.scale;

    return data.map(item => {
      const x = Number(xScale(Number(item[xKey] ?? 0)).toFixed(1));
      const y = Number(yScale(Number(item[yKey] ?? 0)).toFixed(1));
      const rawZ = zKey && item[zKey] != null ? Number(item[zKey]) : undefined;
      const size = rawZ != null && zScale ? zScale(rawZ) : rawZ;
      return { x, y, size, payload: item };
    });
  });
}
