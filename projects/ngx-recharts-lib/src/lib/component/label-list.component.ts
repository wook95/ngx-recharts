import { ChangeDetectionStrategy, Component, input, computed, inject } from '@angular/core';
import { LabelComponent, LabelPosition, ViewBox } from './label.component';
import { ChartData, getDataValue } from '../core/types';

export interface LabelListEntry {
  value: number | string | Array<number | string>;
  payload: any;
  fill?: string;
  viewBox: ViewBox;
  parentViewBox?: ViewBox;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

@Component({
  selector: 'svg:g[ngx-label-list]',
  standalone: true,
  imports: [LabelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g class="recharts-label-list">
      @for (entry of labelEntries(); track $index; let i = $index) {
        <ngx-label
          [viewBox]="entry.viewBox"
          [parentViewBox]="entry.parentViewBox"
          [value]="getLabelValue(entry, i)"
          [position]="position()"
          [offset]="offset()"
          [angle]="angle()"
          [fill]="fill() || entry.fill || '#666'"
          [textBreakAll]="textBreakAll()"
          [formatter]="formatter()"
          [className]="'recharts-label-list-item'">
        </ngx-label>
      }
    </svg:g>
  `
})
export class LabelListComponent {
  // Inputs
  data = input<ChartData[]>([]);
  dataKey = input<string>();
  valueAccessor = input<(entry: LabelListEntry, index: number) => string | number | undefined>();
  position = input<LabelPosition>('center');
  offset = input<number>(5);
  angle = input<number>();
  fill = input<string>();
  textBreakAll = input<boolean>(false);
  formatter = input<(label: any) => any>();
  points = input<Array<{ x: number; y: number; width?: number; height?: number; value?: number | string }>>([]);

  // Computed label entries
  labelEntries = computed(() => {
    const data = this.data();
    if (!data || data.length === 0) return [];

    const pts = this.points();

    return data.map((item, index) => {
      let viewBox: ViewBox;

      if (pts && pts.length > index) {
        const pt = pts[index];
        viewBox = {
          x: pt.x,
          y: pt.y,
          width: pt.width ?? 0,
          height: pt.height ?? 0
        };
      } else {
        // Fallback: use item coordinates if present, otherwise space evenly
        const x = typeof (item as any).x === 'number' ? (item as any).x : index * 50;
        const y = typeof (item as any).y === 'number' ? (item as any).y : 0;
        viewBox = {
          x,
          y,
          width: 0,
          height: 0
        };
      }

      const entry: LabelListEntry = {
        value: this.dataKey() ? getDataValue(item, this.dataKey()!) : item,
        payload: item,
        viewBox,
        fill: '#666'
      };

      return entry;
    });
  });

  getLabelValue(entry: LabelListEntry, index: number): string | number {
    const valueAccessor = this.valueAccessor();
    const dataKey = this.dataKey();

    if (valueAccessor) {
      return valueAccessor(entry, index) || '';
    }

    if (dataKey && entry.payload) {
      return getDataValue(entry.payload, dataKey);
    }

    if (Array.isArray(entry.value)) {
      return entry.value[entry.value.length - 1] || '';
    }

    return entry.value || '';
  }
}