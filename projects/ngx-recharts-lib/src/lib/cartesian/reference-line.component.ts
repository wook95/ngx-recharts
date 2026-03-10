import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { ChartMouseEvent } from '../core/event-types';
import { AxisRegistryService } from '../services/axis-registry.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

export interface ReferenceLineSegmentPoint {
  x?: any;
  y?: any;
}

@Component({
  selector: 'svg:g[ngx-reference-line]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lineCoords(); as coords) {
      <svg:line
        class="recharts-reference-line-line"
        [attr.x1]="coords.x1"
        [attr.y1]="coords.y1"
        [attr.x2]="coords.x2"
        [attr.y2]="coords.y2"
        [attr.stroke]="stroke()"
        [attr.stroke-width]="strokeWidth()"
        [attr.stroke-dasharray]="strokeDasharray() || null"
        [attr.fill]="fill()"
        [attr.fill-opacity]="fillOpacity()"
        (click)="handleClick($event)"
        (mousedown)="handleMouseDown($event)"
        (mouseup)="handleMouseUp($event)"
        (mousemove)="handleMouseMove($event)"
        (mouseover)="handleMouseOver($event)"
        (mouseout)="handleMouseOut($event)"
        (mouseenter)="handleMouseEnter($event)"
        (mouseleave)="handleMouseLeave($event)"
      />
      @if (label()) {
        <svg:text
          class="recharts-label"
          [attr.x]="labelPosition(coords).x"
          [attr.y]="labelPosition(coords).y"
          text-anchor="middle"
          fill="#666"
        >{{ label() }}</svg:text>
      }
    }
  `,
})
export class ReferenceLineComponent {
  private axisRegistry = inject(AxisRegistryService, { optional: true });
  private responsiveService = inject(ResponsiveContainerService, { optional: true });

  x = input<any>(undefined);
  y = input<any>(undefined);
  xAxisId = input<string>('0');
  yAxisId = input<string>('0');
  stroke = input<string>('#ccc');
  strokeWidth = input<number>(1);
  strokeDasharray = input<string>('');
  fill = input<string>('none');
  fillOpacity = input<number>(1);
  label = input<string | undefined>(undefined);
  ifOverflow = input<'discard' | 'hidden' | 'visible' | 'extendDomain'>('discard');
  segment = input<[ReferenceLineSegmentPoint, ReferenceLineSegmentPoint] | undefined>(undefined);

  // Event outputs
  refLineClick = output<ChartMouseEvent>();
  refLineMouseDown = output<ChartMouseEvent>();
  refLineMouseUp = output<ChartMouseEvent>();
  refLineMouseMove = output<ChartMouseEvent>();
  refLineMouseOver = output<ChartMouseEvent>();
  refLineMouseOut = output<ChartMouseEvent>();
  refLineMouseEnter = output<ChartMouseEvent>();
  refLineMouseLeave = output<ChartMouseEvent>();

  private emitEvent(event: MouseEvent): ChartMouseEvent {
    return {
      nativeEvent: event,
      payload: { x: this.x(), y: this.y() },
      index: 0,
    };
  }

  handleClick(event: MouseEvent) { this.refLineClick.emit(this.emitEvent(event)); }
  handleMouseDown(event: MouseEvent) { this.refLineMouseDown.emit(this.emitEvent(event)); }
  handleMouseUp(event: MouseEvent) { this.refLineMouseUp.emit(this.emitEvent(event)); }
  handleMouseMove(event: MouseEvent) { this.refLineMouseMove.emit(this.emitEvent(event)); }
  handleMouseOver(event: MouseEvent) { this.refLineMouseOver.emit(this.emitEvent(event)); }
  handleMouseOut(event: MouseEvent) { this.refLineMouseOut.emit(this.emitEvent(event)); }
  handleMouseEnter(event: MouseEvent) { this.refLineMouseEnter.emit(this.emitEvent(event)); }
  handleMouseLeave(event: MouseEvent) { this.refLineMouseLeave.emit(this.emitEvent(event)); }

  private plotWidth = computed(() => this.responsiveService?.plotWidth() ?? 400);
  private plotHeight = computed(() => this.responsiveService?.plotHeight() ?? 300);

  private toPixelX(value: any): number | null {
    const scale = this.axisRegistry?.getXAxisScale(this.xAxisId());
    if (scale) {
      const px = scale(value);
      return px != null ? Number(px) : null;
    }
    return typeof value === 'number' ? value : null;
  }

  private toPixelY(value: any): number | null {
    const scale = this.axisRegistry?.getYAxisScale(this.yAxisId());
    if (scale) {
      const px = scale(value);
      return px != null ? Number(px) : null;
    }
    return typeof value === 'number' ? value : null;
  }

  lineCoords = computed((): { x1: number; y1: number; x2: number; y2: number } | null => {
    const seg = this.segment();
    const width = this.plotWidth();
    const height = this.plotHeight();

    if (seg) {
      const [p1, p2] = seg;
      const x1 = p1.x != null ? (this.toPixelX(p1.x) ?? 0) : 0;
      const y1 = p1.y != null ? (this.toPixelY(p1.y) ?? 0) : 0;
      const x2 = p2.x != null ? (this.toPixelX(p2.x) ?? 0) : 0;
      const y2 = p2.y != null ? (this.toPixelY(p2.y) ?? 0) : 0;
      return { x1, y1, x2, y2 };
    }

    const xVal = this.x();
    if (xVal != null) {
      const px = this.toPixelX(xVal);
      if (px == null) return null;
      return { x1: px, y1: 0, x2: px, y2: height };
    }

    const yVal = this.y();
    if (yVal != null) {
      const py = this.toPixelY(yVal);
      if (py == null) return null;
      return { x1: 0, y1: py, x2: width, y2: py };
    }

    return null;
  });

  labelPosition(coords: { x1: number; y1: number; x2: number; y2: number }): { x: number; y: number } {
    return {
      x: (coords.x1 + coords.x2) / 2,
      y: (coords.y1 + coords.y2) / 2 - 6,
    };
  }
}
