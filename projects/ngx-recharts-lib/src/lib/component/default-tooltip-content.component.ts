import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'ngx-default-tooltip-content',
  standalone: true,
  imports: [NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'ngx-tooltip-content ' + wrapperClassName()" [ngStyle]="contentStyle()">
      @if (formattedLabel()) {
        <p [class]="'ngx-tooltip-label ' + labelClassName()" [ngStyle]="labelStyle()">{{ formattedLabel() }}</p>
      }
      <ul class="ngx-tooltip-items" style="list-style: none; padding: 0; margin: 0;">
        @for (item of sortedPayload(); track $index) {
          <li [ngStyle]="mergedItemStyle(item)" style="padding: 2px 0;">
            <span [style.color]="item.color || item.fill">{{ item.name }}</span>
            <span>{{ separator() }}</span>
            <span>{{ formatValue(item) }}</span>
          </li>
        }
      </ul>
    </div>
  `,
})
export class DefaultTooltipContentComponent {
  separator = input<string>(':');
  payload = input<any[]>([]);
  label = input<string>('');
  formatter = input<((value: any, name: string, props: any) => string) | null>(null);
  labelFormatter = input<((label: string) => string) | null>(null);
  itemSorter = input<((a: any, b: any) => number) | null>(null);
  contentStyle = input<Record<string, string>>({});
  labelStyle = input<Record<string, string>>({});
  itemStyle = input<Record<string, string>>({});
  filterNull = input<boolean>(true);
  labelClassName = input<string>('');
  wrapperClassName = input<string>('');

  formattedLabel = computed(() => {
    const label = this.label();
    const formatter = this.labelFormatter();
    return formatter ? formatter(label) : label;
  });

  sortedPayload = computed(() => {
    let items = this.payload();

    if (this.filterNull()) {
      items = items.filter((item: any) => item.value != null);
    }

    const sorter = this.itemSorter();
    if (sorter) {
      items = [...items].sort(sorter);
    }

    return items;
  });

  mergedItemStyle(item: any): Record<string, string> {
    return { ...this.itemStyle(), color: item.color || item.fill || '' };
  }

  formatValue(item: any): string {
    const formatter = this.formatter();
    if (formatter) {
      return formatter(item.value, item.name, item);
    }
    if (typeof item.value === 'number') {
      return item.value.toLocaleString();
    }
    return String(item.value ?? '');
  }
}
