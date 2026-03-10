import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { pie as d3Pie } from 'd3-shape';
import { ChartMouseEvent } from '../core/event-types';
import { PolarCoordinateService } from '../services/polar-coordinate.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { ChartDataService } from '../services/chart-data.service';
import { SectorComponent } from '../shape/sector.component';
import { CellComponent } from '../component/cell.component';

export interface PieSectorData {
  startAngle: number;  // degrees, for SectorComponent
  endAngle: number;    // degrees, for SectorComponent
  innerRadius: number;
  outerRadius: number;
  fill: string;
  name: string;
  value: number;
  payload: any;
}

@Component({
  selector: 'svg:g[ngx-pie]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectorComponent],
  template: `
    @if (!hide()) {
      @for (sector of sectors(); track $index) {
        <svg:g ngx-sector
          [cx]="resolvedCx()"
          [cy]="resolvedCy()"
          [innerRadius]="sector.innerRadius"
          [outerRadius]="sector.outerRadius"
          [startAngle]="sector.startAngle"
          [endAngle]="sector.endAngle"
          [cornerRadius]="cornerRadius()"
          [fill]="sector.fill"
          [stroke]="stroke()"
          [strokeWidth]="strokeWidth()"
          [isAnimationActive]="isAnimationActive()"
          [animationBegin]="animationBegin()"
          [animationDuration]="animationDuration()"
          [animationEasing]="animationEasing()"
          (sectorClick)="handleSectorClick($event, sector, $index)"
          (sectorMouseDown)="handleSectorMouseDown($event, sector, $index)"
          (sectorMouseUp)="handleSectorMouseUp($event, sector, $index)"
          (sectorMouseMove)="handleSectorMouseMove($event, sector, $index)"
          (sectorMouseOver)="handleSectorMouseOver($event, sector, $index)"
          (sectorMouseOut)="handleSectorMouseOut($event, sector, $index)"
          (sectorMouseEnter)="handleSectorMouseEnter($event, sector, $index)"
          (sectorMouseLeave)="handleSectorMouseLeave($event, sector, $index)"
        />
      }
    }
  `,
})
export class PieComponent implements OnDestroy {
  private readonly polarService = inject(PolarCoordinateService, { optional: true });
  private readonly registryService = inject(GraphicalItemRegistryService, { optional: true });
  private readonly chartDataService = inject(ChartDataService, { optional: true });

  private static nextId = 0;
  private readonly itemId = `pie-${PieComponent.nextId++}`;

  // Inputs
  data = input<any[]>();
  dataKey = input.required<string>();
  nameKey = input<string>('name');
  cx = input<number | string>();
  cy = input<number | string>();
  innerRadius = input<number>(0);
  outerRadius = input<number>();
  startAngle = input<number>(0);
  endAngle = input<number>(360);
  minAngle = input<number>(0);
  paddingAngle = input<number>(0);
  cornerRadius = input<number>(0);
  fill = input<string>('#8884d8');
  stroke = input<string>('#fff');
  strokeWidth = input<number>(1);
  label = input<boolean | ((props: any) => string)>(false);
  labelLine = input<boolean>(false);
  legendType = input<string>('rect');
  hide = input<boolean>(false);
  name = input<string>('');

  // Animation inputs
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(300);
  animationEasing = input<string>('ease');

  pieClick = output<ChartMouseEvent>();
  pieMouseDown = output<ChartMouseEvent>();
  pieMouseUp = output<ChartMouseEvent>();
  pieMouseMove = output<ChartMouseEvent>();
  pieMouseOver = output<ChartMouseEvent>();
  pieMouseOut = output<ChartMouseEvent>();
  pieMouseEnter = output<ChartMouseEvent>();
  pieMouseLeave = output<ChartMouseEvent>();

  cells = contentChildren(CellComponent);

  constructor() {
    effect(() => {
      if (this.registryService) {
        this.registryService.replace(this.itemId, {
          id: this.itemId,
          dataKey: this.dataKey(),
          type: 'pie',
          fill: this.fill(),
          stroke: this.stroke(),
          name: this.name() || this.dataKey(),
          hide: this.hide(),
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.registryService?.unregister(this.itemId);
  }

  resolvedCx = computed<number>(() => {
    const cx = this.cx();
    if (cx !== undefined) {
      return typeof cx === 'string' ? parseFloat(cx) : cx;
    }
    return this.polarService?.cx() ?? 0;
  });

  resolvedCy = computed<number>(() => {
    const cy = this.cy();
    if (cy !== undefined) {
      return typeof cy === 'string' ? parseFloat(cy) : cy;
    }
    return this.polarService?.cy() ?? 0;
  });

  resolvedOuterRadius = computed<number>(() => {
    const or = this.outerRadius();
    if (or !== undefined) return or;
    return this.polarService?.outerRadius() ?? 80;
  });

  resolvedData = computed<any[]>(() => {
    const explicit = this.data();
    if (explicit !== undefined && explicit.length > 0) return explicit;
    return this.chartDataService?.data() ?? [];
  });

  sectors = computed<PieSectorData[]>(() => {
    const data = this.resolvedData();
    if (!data.length) return [];

    const dataKey = this.dataKey();
    const nameKey = this.nameKey();
    const innerRadius = this.innerRadius();
    const outerRadius = this.resolvedOuterRadius();
    const startAngleDeg = this.startAngle();
    const endAngleDeg = this.endAngle();
    const paddingAngle = this.paddingAngle();
    const defaultFill = this.fill();
    const cells = this.cells();

    const pieGenerator = d3Pie<any>()
      .value((d: any) => Math.max(0, d[dataKey] ?? 0))
      .startAngle(startAngleDeg * Math.PI / 180)
      .endAngle(endAngleDeg * Math.PI / 180)
      .padAngle(paddingAngle * Math.PI / 180)
      .sort(null);

    const arcs = pieGenerator(data);

    return arcs.map((arc, index) => {
      const cellFill = cells[index]?.fill() ?? defaultFill;
      return {
        // Convert radians back to degrees for SectorComponent (which multiplies by PI/180 again)
        startAngle: arc.startAngle * 180 / Math.PI,
        endAngle: arc.endAngle * 180 / Math.PI,
        innerRadius,
        outerRadius,
        fill: cellFill,
        name: arc.data[nameKey] ?? String(index),
        value: arc.data[dataKey] ?? 0,
        payload: arc.data,
      };
    });
  });

  handleSectorClick(event: MouseEvent, sectorData: any, index: number) {
    this.pieClick.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: sectorData,
      index,
      value: sectorData?.value,
    });
  }

  handleSectorMouseEnter(event: MouseEvent, sectorData: any, index: number) {
    this.pieMouseEnter.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: sectorData,
      index,
      value: sectorData?.value,
    });
  }

  handleSectorMouseDown(event: MouseEvent, sectorData: any, index: number) {
    this.pieMouseDown.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: sectorData,
      index,
      value: sectorData?.value,
    });
  }

  handleSectorMouseUp(event: MouseEvent, sectorData: any, index: number) {
    this.pieMouseUp.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: sectorData,
      index,
      value: sectorData?.value,
    });
  }

  handleSectorMouseMove(event: MouseEvent, sectorData: any, index: number) {
    this.pieMouseMove.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: sectorData,
      index,
      value: sectorData?.value,
    });
  }

  handleSectorMouseOver(event: MouseEvent, sectorData: any, index: number) {
    this.pieMouseOver.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: sectorData,
      index,
      value: sectorData?.value,
    });
  }

  handleSectorMouseOut(event: MouseEvent, sectorData: any, index: number) {
    this.pieMouseOut.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: sectorData,
      index,
      value: sectorData?.value,
    });
  }

  handleSectorMouseLeave(event: MouseEvent, sectorData: any, index: number) {
    this.pieMouseLeave.emit({
      nativeEvent: event,
      dataKey: this.dataKey() as string,
      payload: sectorData,
      index,
      value: sectorData?.value,
    });
  }
}
