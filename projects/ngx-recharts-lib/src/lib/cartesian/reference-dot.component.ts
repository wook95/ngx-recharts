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
import { DotComponent } from '../shape/dot.component';

@Component({
  selector: 'svg:g[ngx-reference-dot]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DotComponent],
  template: `
    @if (pixelCoords(); as coords) {
      <svg:g
        (click)="handleClick($event)"
        (mousedown)="handleMouseDown($event)"
        (mouseup)="handleMouseUp($event)"
        (mousemove)="handleMouseMove($event)"
        (mouseover)="handleMouseOver($event)"
        (mouseout)="handleMouseOut($event)"
        (mouseenter)="handleMouseEnter($event)"
        (mouseleave)="handleMouseLeave($event)"
      >
        <svg:g
          ngx-dot
          [cx]="coords.x"
          [cy]="coords.y"
          [r]="r()"
          [fill]="fill()"
          [stroke]="stroke()"
          [strokeWidth]="strokeWidth()"
        />
        @if (label()) {
          <svg:text
            class="recharts-label"
            [attr.x]="coords.x"
            [attr.y]="coords.y - r() - 4"
            text-anchor="middle"
            fill="#666"
          >{{ label() }}</svg:text>
        }
      </svg:g>
    }
  `,
})
export class ReferenceDotComponent {
  private axisRegistry = inject(AxisRegistryService, { optional: true });
  private responsiveService = inject(ResponsiveContainerService, { optional: true });

  x = input.required<any>();
  y = input.required<any>();
  xAxisId = input<string>('0');
  yAxisId = input<string>('0');
  r = input<number>(10);
  fill = input<string>('#fff');
  stroke = input<string>('#ccc');
  strokeWidth = input<number>(1);
  label = input<string | undefined>(undefined);
  ifOverflow = input<string>('discard');

  // Event outputs
  refDotClick = output<ChartMouseEvent>();
  refDotMouseDown = output<ChartMouseEvent>();
  refDotMouseUp = output<ChartMouseEvent>();
  refDotMouseMove = output<ChartMouseEvent>();
  refDotMouseOver = output<ChartMouseEvent>();
  refDotMouseOut = output<ChartMouseEvent>();
  refDotMouseEnter = output<ChartMouseEvent>();
  refDotMouseLeave = output<ChartMouseEvent>();

  private emitEvent(event: MouseEvent): ChartMouseEvent {
    return {
      nativeEvent: event,
      payload: { x: this.x(), y: this.y() },
      index: 0,
    };
  }

  handleClick(event: MouseEvent) { this.refDotClick.emit(this.emitEvent(event)); }
  handleMouseDown(event: MouseEvent) { this.refDotMouseDown.emit(this.emitEvent(event)); }
  handleMouseUp(event: MouseEvent) { this.refDotMouseUp.emit(this.emitEvent(event)); }
  handleMouseMove(event: MouseEvent) { this.refDotMouseMove.emit(this.emitEvent(event)); }
  handleMouseOver(event: MouseEvent) { this.refDotMouseOver.emit(this.emitEvent(event)); }
  handleMouseOut(event: MouseEvent) { this.refDotMouseOut.emit(this.emitEvent(event)); }
  handleMouseEnter(event: MouseEvent) { this.refDotMouseEnter.emit(this.emitEvent(event)); }
  handleMouseLeave(event: MouseEvent) { this.refDotMouseLeave.emit(this.emitEvent(event)); }

  pixelCoords = computed((): { x: number; y: number } | null => {
    const xScale = this.axisRegistry?.getXAxisScale(this.xAxisId());
    const yScale = this.axisRegistry?.getYAxisScale(this.yAxisId());

    let px: number;
    let py: number;

    if (xScale) {
      const scaled = xScale(this.x());
      if (scaled == null) return null;
      px = Number(scaled);
    } else {
      const raw = this.x();
      if (typeof raw !== 'number') return null;
      px = raw;
    }

    if (yScale) {
      const scaled = yScale(this.y());
      if (scaled == null) return null;
      py = Number(scaled);
    } else {
      const raw = this.y();
      if (typeof raw !== 'number') return null;
      py = raw;
    }

    return { x: px, y: py };
  });
}
