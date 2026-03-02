import { ChangeDetectionStrategy, Component, input, computed, inject, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LabelComponent, LabelPosition } from './label.component';
import { TrapezoidViewBox, cartesianToTrapezoid } from '../core/label-types';
import { ChartData, getDataValue } from '../core/types';
import { CartesianLabelListContextService, PolarLabelListContextService, LabelListEntry } from '../context/label-list-context.service';

@Component({
  selector: 'svg:g[ngx-label-list]',
  standalone: true,
  imports: [NgTemplateOutlet, LabelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g class="recharts-label-list">
      @if (shouldRenderContent()) {
        @for (entry of labelEntries(); track $index; let i = $index) {
          <ng-container *ngTemplateOutlet="content()!; context: getContentContext(entry, i)"></ng-container>
        }
      } @else {
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
            [id]="id() ? id() + '-' + i : undefined"
            [className]="'recharts-label-list-item'">
          </ngx-label>
        }
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
  content = input<TemplateRef<any>>();
  id = input<string>();
  clockWise = input<boolean>(false);
  points = input<Array<{ x: number; y: number; width?: number; height?: number; value?: number | string }>>([]);

  // Check if content template should be rendered
  shouldRenderContent = computed(() => this.content() != null);

  // Computed label entries from context or data prop
  labelEntries = computed(() => {
    // Try cartesian context first
    const cartesianEntries = this.cartesianContext?.getEntries()();
    if (cartesianEntries && cartesianEntries.length > 0) {
      return cartesianEntries;
    }

    // Try polar context
    const polarEntries = this.polarContext?.getEntries()();
    if (polarEntries && polarEntries.length > 0) {
      return polarEntries;
    }

    // Fallback to data prop logic
    const data = this.data();
    if (!data || data.length === 0) return [];

    const pts = this.points();

    return data.map((item, index) => {
      let viewBox: TrapezoidViewBox;

      if (pts && pts.length > index) {
        const pt = pts[index];
        viewBox = cartesianToTrapezoid({
          x: pt.x,
          y: pt.y,
          width: pt.width ?? 0,
          height: pt.height ?? 0
        });
      } else {
        const x = typeof (item as any).x === 'number' ? (item as any).x : index * 50;
        const y = typeof (item as any).y === 'number' ? (item as any).y : 0;
        viewBox = cartesianToTrapezoid({ x, y, width: 0, height: 0 });
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
