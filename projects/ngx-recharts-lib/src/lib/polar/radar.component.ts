import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { ChartMouseEvent } from '../core/event-types';
import { ChartDataService } from '../services/chart-data.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { PolarCoordinateService } from '../services/polar-coordinate.service';
import { DotComponent } from '../shape/dot.component';
import { PolygonComponent } from '../shape/polygon.component';

interface RadarPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'svg:g[ngx-radar]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PolygonComponent, DotComponent],
  template: `
    @if (!hide()) {
      <svg:g
        (click)="handleRadarClick($event)"
        (mousedown)="handleRadarMouseDown($event)"
        (mouseup)="handleRadarMouseUp($event)"
        (mousemove)="handleRadarMouseMove($event)"
        (mouseover)="handleRadarMouseOver($event)"
        (mouseout)="handleRadarMouseOut($event)"
        (mouseenter)="handleRadarMouseEnter($event)"
        (mouseleave)="handleRadarMouseLeave($event)"
      >
        <svg:g ngx-polygon
          [points]="radarPoints()"
          [fill]="fill()"
          [fillOpacity]="fillOpacity()"
          [stroke]="stroke()"
          [strokeWidth]="strokeWidth()"
          [isAnimationActive]="isAnimationActive()"
          [animationBegin]="animationBegin()"
          [animationDuration]="animationDuration()"
          [animationEasing]="animationEasing()"
        />
      </svg:g>
      @if (dot()) {
        @for (point of radarPoints(); track $index) {
          <svg:g ngx-dot
            [cx]="point.x"
            [cy]="point.y"
            [r]="4"
            [fill]="fill()"
            [stroke]="stroke()"
            [isAnimationActive]="isAnimationActive()"
            [animationBegin]="animationBegin()"
            [animationDuration]="animationDuration()"
            [animationEasing]="animationEasing()"
          />
        }
      }
    }
  `,
})
export class RadarComponent implements OnDestroy {
  private polarService = inject(PolarCoordinateService, { optional: true });
  private registryService = inject(GraphicalItemRegistryService, { optional: true });
  private chartDataService = inject(ChartDataService, { optional: true });

  private static nextId = 0;
  private readonly itemId = `radar-${RadarComponent.nextId++}`;

  constructor() {
    effect(() => {
      this.registryService?.replace(this.itemId, {
        id: this.itemId,
        type: 'radar',
        dataKey: this.dataKey(),
        name: this.name(),
        stroke: this.stroke(),
        hide: this.hide(),
        strokeWidth: this.strokeWidth(),
      });
    });
  }

  ngOnDestroy(): void {
    this.registryService?.unregister(this.itemId);
  }

  // Core inputs
  dataKey = input.required<string>();
  data = input<any[]>([]);
  name = input<string>('');
  shape = input<'polygon' | 'circle'>('polygon');
  dot = input<boolean>(false);
  activeDot = input<boolean>(false);
  legendType = input<string>('rect');
  label = input<boolean>(false);
  fill = input<string>('#8884d8');
  fillOpacity = input<number>(0.6);
  stroke = input<string>('#8884d8');
  strokeWidth = input<number>(1);
  hide = input<boolean>(false);

  // Animation inputs
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(300);
  animationEasing = input<string>('ease');

  // Event outputs
  radarClick = output<ChartMouseEvent>();
  radarMouseDown = output<ChartMouseEvent>();
  radarMouseUp = output<ChartMouseEvent>();
  radarMouseMove = output<ChartMouseEvent>();
  radarMouseOver = output<ChartMouseEvent>();
  radarMouseOut = output<ChartMouseEvent>();
  radarMouseEnter = output<ChartMouseEvent>();
  radarMouseLeave = output<ChartMouseEvent>();

  handleRadarClick(event: MouseEvent) {
    this.radarClick.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleRadarMouseEnter(event: MouseEvent) {
    this.radarMouseEnter.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleRadarMouseDown(event: MouseEvent) {
    this.radarMouseDown.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleRadarMouseUp(event: MouseEvent) {
    this.radarMouseUp.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleRadarMouseMove(event: MouseEvent) {
    this.radarMouseMove.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleRadarMouseOver(event: MouseEvent) {
    this.radarMouseOver.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleRadarMouseOut(event: MouseEvent) {
    this.radarMouseOut.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: this.resolvedData(),
      index: 0,
    });
  }

  handleRadarMouseLeave(event: MouseEvent) {
    this.radarMouseLeave.emit({
      nativeEvent: event,
      dataKey: this.dataKey(),
      payload: this.resolvedData(),
      index: 0,
    });
  }

  resolvedData = computed(() => {
    const explicit = this.data();
    return explicit.length > 0 ? explicit : (this.chartDataService?.data() ?? []);
  });

  radarPoints = computed((): RadarPoint[] => {
    const data = this.resolvedData();
    if (!data.length) return [];

    const dataKey = this.dataKey();
    const cx = this.polarService?.cx() ?? 0;
    const cy = this.polarService?.cy() ?? 0;
    const outerRadius = this.polarService?.outerRadius() ?? 0;
    const startAngle = this.polarService?.startAngle() ?? 0;

    const values = data.map(d => {
      const v = d[dataKey];
      return typeof v === 'number' ? v : 0;
    });
    const maxValue = Math.max(...values, 1);

    const angleStep = 360 / data.length;

    return data.map((d, i) => {
      const value = typeof d[dataKey] === 'number' ? d[dataKey] : 0;
      const normalizedRadius = (value / maxValue) * outerRadius;
      const angle = angleStep * i + startAngle;
      const radian = (angle - 90) * Math.PI / 180;
      return {
        x: cx + normalizedRadius * Math.cos(radian),
        y: cy + normalizedRadius * Math.sin(radian),
      };
    });
  });
}
