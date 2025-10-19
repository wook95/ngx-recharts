import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, LabelComponent],
  template: `
    <svg:g class="recharts-label-list">
      <ngx-label
        *ngFor="let entry of labelEntries(); let i = index"
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
  content = input<any>(); // React element or function for custom rendering
  id = input<string>(); // Unique id for SSR
  clockWise = input<boolean>(false); // For radial charts

  // Computed label entries
  labelEntries = computed(() => {
    const data = this.data();
    if (!data || data.length === 0) return [];

    return data.map((item, index) => {
      // Create a basic viewBox for each data point
      // In a real implementation, this would come from the parent chart component
      const viewBox: ViewBox = {
        x: index * 50, // Simplified positioning
        y: 0,
        width: 40,
        height: 20
      };

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