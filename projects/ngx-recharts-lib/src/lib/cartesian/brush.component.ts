import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ChartDataService } from '../services/chart-data.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

export interface BrushChangeEvent {
  startIndex: number;
  endIndex: number;
}

type DragType = 'start' | 'end' | 'slide';

@Component({
  selector: 'svg:g[ngx-brush]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g [attr.transform]="'translate(' + resolvedX() + ',' + resolvedY() + ')'">
      <!-- Background -->
      <svg:rect
        [attr.x]="0"
        [attr.y]="0"
        [attr.width]="resolvedWidth()"
        [attr.height]="height()"
        [attr.fill]="fill()"
        [attr.stroke]="stroke()"
        stroke-width="1"
      />

      <!-- Selected slide area -->
      <svg:rect
        [attr.x]="slideX()"
        [attr.y]="0"
        [attr.width]="slideWidth()"
        [attr.height]="height()"
        fill="rgba(0,0,0,0.1)"
        stroke="none"
        style="cursor: move"
        (mousedown)="onSlideMouseDown($event)"
      />

      <!-- Left traveller -->
      <svg:rect
        [attr.x]="slideX() - travellerWidth()"
        [attr.y]="0"
        [attr.width]="travellerWidth()"
        [attr.height]="height()"
        fill="#666"
        stroke="#333"
        stroke-width="1"
        rx="1"
        style="cursor: col-resize"
        (mousedown)="onTravellerMouseDown($event, 'start')"
      />

      <!-- Right traveller -->
      <svg:rect
        [attr.x]="slideX() + slideWidth()"
        [attr.y]="0"
        [attr.width]="travellerWidth()"
        [attr.height]="height()"
        fill="#666"
        stroke="#333"
        stroke-width="1"
        rx="1"
        style="cursor: col-resize"
        (mousedown)="onTravellerMouseDown($event, 'end')"
      />

      <!-- Start/End text labels -->
      @if (alwaysShowText()) {
        <svg:text [attr.x]="slideX()" [attr.y]="height() + 14" text-anchor="middle" font-size="11">
          {{ currentStartIndex() }}
        </svg:text>
        <svg:text [attr.x]="slideX() + slideWidth()" [attr.y]="height() + 14" text-anchor="middle" font-size="11">
          {{ currentEndIndex() }}
        </svg:text>
      }
    </svg:g>
  `,
})
export class BrushComponent implements OnDestroy {
  private document = inject(DOCUMENT);
  private chartDataService = inject(ChartDataService, { optional: true });
  private responsiveService = inject(ResponsiveContainerService, { optional: true });

  // Inputs
  dataKey = input<string | undefined>(undefined);
  x = input<number>(0);
  y = input<number | undefined>(undefined);
  width = input<number | undefined>(undefined);
  height = input<number>(40);
  data = input<any[] | undefined>(undefined);
  travellerWidth = input<number>(5);
  gap = input<number>(1);
  startIndex = input<number>(0);
  endIndex = input<number | undefined>(undefined);
  fill = input<string>('#eee');
  stroke = input<string>('#999');
  padding = input<{ top: number; bottom: number }>({ top: 1, bottom: 1 });
  alwaysShowText = input<boolean>(false);

  // Outputs
  onChange = output<BrushChangeEvent>();

  // Internal mutable state for drag-updated indices
  private _startIndex = signal<number | null>(null);
  private _endIndex = signal<number | null>(null);

  // Resolved data
  resolvedData = computed(() => {
    const explicit = this.data();
    if (explicit !== undefined) return explicit;
    return this.chartDataService?.data() ?? [];
  });

  resolvedWidth = computed(() => {
    const w = this.width();
    if (w !== undefined) return w;
    return this.responsiveService?.plotWidth() ?? 400;
  });

  resolvedX = computed(() => this.x());

  resolvedY = computed(() => {
    const y = this.y();
    if (y !== undefined) return y;
    const plotHeight = this.responsiveService?.plotHeight() ?? 300;
    const totalOffset = this.responsiveService?.totalOffset();
    const topOffset = totalOffset?.top ?? 0;
    return topOffset + plotHeight + 10;
  });

  currentStartIndex = computed(() => {
    const override = this._startIndex();
    return override !== null ? override : this.startIndex();
  });

  currentEndIndex = computed(() => {
    const override = this._endIndex();
    if (override !== null) return override;
    const ei = this.endIndex();
    if (ei !== undefined) return ei;
    const len = this.resolvedData().length;
    return len > 0 ? len - 1 : 0;
  });

  slideX = computed(() => {
    const total = this.resolvedWidth();
    const dataLen = this.resolvedData().length;
    if (dataLen <= 1) return 0;
    const tw = this.travellerWidth();
    const usable = total - tw * 2;
    return tw + (this.currentStartIndex() / (dataLen - 1)) * usable;
  });

  slideWidth = computed(() => {
    const total = this.resolvedWidth();
    const dataLen = this.resolvedData().length;
    if (dataLen <= 1) return total;
    const tw = this.travellerWidth();
    const usable = total - tw * 2;
    const startX = (this.currentStartIndex() / (dataLen - 1)) * usable;
    const endX = (this.currentEndIndex() / (dataLen - 1)) * usable;
    return Math.max(0, endX - startX);
  });

  // Drag state
  private dragType: DragType | null = null;
  private dragStartMouseX = 0;
  private dragStartStartIndex = 0;
  private dragStartEndIndex = 0;

  private boundMouseMove = this.onDocumentMouseMove.bind(this);
  private boundMouseUp = this.onDocumentMouseUp.bind(this);

  onTravellerMouseDown(event: MouseEvent, type: 'start' | 'end'): void {
    event.preventDefault();
    this.dragType = type;
    this.dragStartMouseX = event.clientX;
    this.dragStartStartIndex = this.currentStartIndex();
    this.dragStartEndIndex = this.currentEndIndex();
    this.document.addEventListener('mousemove', this.boundMouseMove);
    this.document.addEventListener('mouseup', this.boundMouseUp);
  }

  onSlideMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.dragType = 'slide';
    this.dragStartMouseX = event.clientX;
    this.dragStartStartIndex = this.currentStartIndex();
    this.dragStartEndIndex = this.currentEndIndex();
    this.document.addEventListener('mousemove', this.boundMouseMove);
    this.document.addEventListener('mouseup', this.boundMouseUp);
  }

  private onDocumentMouseMove(event: MouseEvent): void {
    if (this.dragType === null) return;

    const dx = event.clientX - this.dragStartMouseX;
    const dataLen = this.resolvedData().length;
    if (dataLen <= 1) return;

    const total = this.resolvedWidth();
    const tw = this.travellerWidth();
    const usable = total - tw * 2;
    const indexPerPixel = (dataLen - 1) / usable;
    const deltaIndex = Math.round(dx * indexPerPixel);

    let newStart = this.dragStartStartIndex;
    let newEnd = this.dragStartEndIndex;

    if (this.dragType === 'start') {
      newStart = Math.max(0, Math.min(this.dragStartStartIndex + deltaIndex, newEnd));
    } else if (this.dragType === 'end') {
      newEnd = Math.min(dataLen - 1, Math.max(this.dragStartEndIndex + deltaIndex, newStart));
    } else {
      // slide: move both
      const span = this.dragStartEndIndex - this.dragStartStartIndex;
      newStart = Math.max(0, Math.min(this.dragStartStartIndex + deltaIndex, dataLen - 1 - span));
      newEnd = newStart + span;
    }

    this._startIndex.set(newStart);
    this._endIndex.set(newEnd);
    this.onChange.emit({ startIndex: newStart, endIndex: newEnd });
  }

  private onDocumentMouseUp(_event: MouseEvent): void {
    this.dragType = null;
    this.document.removeEventListener('mousemove', this.boundMouseMove);
    this.document.removeEventListener('mouseup', this.boundMouseUp);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('mousemove', this.boundMouseMove);
    this.document.removeEventListener('mouseup', this.boundMouseUp);
  }
}
