import { Component, input, computed, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent, LabelPosition } from './label.component';
import { ChartData, getDataValue } from '../core/types';
import { CartesianLabelListContextService, PolarLabelListContextService, LabelListEntry } from '../context/label-list-context.service';
import { ViewBox } from '../core/label-types';



@Component({
  selector: 'svg:g[ngx-label-list]',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  template: `
    <svg:g class="recharts-label-list">
      @if (shouldRenderContent()) {
        <ng-container *ngFor="let entry of labelEntries(); let i = index">
          <ng-container *ngTemplateOutlet="content()!; context: getContentContext(entry, i)"></ng-container>
        </ng-container>
      } @else {
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
          [id]="id() ? id() + '-' + i : undefined"
          [className]="'recharts-label-list-item'">
        </ngx-label>
      }
    </svg:g>
  `
})
export class LabelListComponent {
  private cartesianContext = inject(CartesianLabelListContextService, { optional: true });
  private polarContext = inject(PolarLabelListContextService, { optional: true });

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
  content = input<TemplateRef<any>>(); // TemplateRef for custom rendering
  id = input<string>(); // Unique id for SSR
  clockWise = input<boolean>(false); // For radial charts

  // Check if content should be rendered
  shouldRenderContent = computed(() => this.content() != null);

  // Computed label entries from context or data prop
  labelEntries = computed(() => {
    // Try to get from context first
    const cartesianEntries = this.cartesianContext?.getEntries()();
    if (cartesianEntries && cartesianEntries.length > 0) {
      return cartesianEntries;
    }

    const polarEntries = this.polarContext?.getEntries()();
    if (polarEntries && polarEntries.length > 0) {
      return polarEntries;
    }

    // Fallback to data prop (simplified)
    const data = this.data();
    if (!data || data.length === 0) return [];

    return data.map((item, index) => {
      const viewBox: ViewBox = {
        x: index * 50,
        y: 0,
        width: 40,
        height: 20
      };

      return {
        value: this.dataKey() ? getDataValue(item, this.dataKey()!) : item,
        payload: item,
        viewBox,
        fill: '#666'
      } as LabelListEntry;
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

  // Context for content template
  getContentContext(entry: LabelListEntry, index: number) {
    return {
      $implicit: this.getLabelValue(entry, index),
      entry,
      index,
      viewBox: entry.viewBox,
      value: this.getLabelValue(entry, index),
      payload: entry.payload
    };
  }
}