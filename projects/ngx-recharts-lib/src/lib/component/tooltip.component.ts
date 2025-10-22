import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import {
  AllowEscapeViewBox,
  ItemSorter,
  LabelFormatter,
  TooltipFormatter,
  TooltipViewBox,
} from '../core/tooltip-types';
import { ChartData } from '../core/types';

export interface TooltipPayload {
  dataKey: string;
  value: any;
  name?: string;
  color?: string;
  payload: ChartData;
}

@Component({
  selector: 'ngx-tooltip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="recharts-tooltip-wrapper" [style]="wrapperStyles()">
      <div class="recharts-default-tooltip" [style]="contentStyles()">
        @if (displayLabel()) {
        <p class="recharts-tooltip-label" [style]="labelStyles()">
          {{ displayLabel() }}
        </p>
        }

        <ul
          class="recharts-tooltip-item-list"
          [style.padding]="'0px'"
          [style.margin]="'0px'"
        >
          @for (item of filteredPayload(); track item.dataKey) {
          <li class="recharts-tooltip-item" [style]="getItemStyle(item)">
            <span class="recharts-tooltip-item-name">{{
              getItemName(item)
            }}</span>
            <span class="recharts-tooltip-item-separator">{{
              separator()
            }}</span>
            <span class="recharts-tooltip-item-value">{{
              getItemValue(item)
            }}</span>
          </li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 1000;
      }

      .recharts-tooltip-wrapper {
        position: absolute;
        pointer-events: none;
        z-index: 1000;
      }

      .recharts-default-tooltip {
        border-radius: 3px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      .recharts-tooltip-item-list {
        list-style: none;
      }

      /* recharts positioning classes */
      .recharts-tooltip-wrapper-right {
        /* tooltip is to the right of cursor */
      }

      .recharts-tooltip-wrapper-left {
        /* tooltip is to the left of cursor */
      }

      .recharts-tooltip-wrapper-top {
        /* tooltip is above cursor */
      }

      .recharts-tooltip-wrapper-bottom {
        /* tooltip is below cursor */
      }
    `,
  ],
})
export class TooltipComponent {
  private elementRef = inject(ElementRef);

  // Core recharts API inputs (can be overridden by service)
  active = input<boolean>(false);
  payload = input<TooltipPayload[]>([]);
  label = input<string>('');
  coordinate = input<{ x: number; y: number }>({ x: 0, y: 0 });

  // recharts API properties
  separator = input<string>(' : ');
  offset = input<number>(10);
  filterNull = input<boolean>(true);
  itemStyle = input<Record<string, any>>({});
  wrapperStyle = input<Record<string, any>>({});
  contentStyle = input<Record<string, any>>({});
  labelStyle = input<Record<string, any>>({});
  cursor = input<boolean | Record<string, any> | any>(true);
  viewBox = input<TooltipViewBox | undefined>(undefined);
  allowEscapeViewBox = input<AllowEscapeViewBox>({ x: false, y: false });
  position = input<{ x: number; y: number } | undefined>(undefined);
  formatter = input<TooltipFormatter | undefined>(undefined);
  labelFormatter = input<LabelFormatter | undefined>(undefined);
  itemSorter = input<ItemSorter | undefined>(undefined);
  shared = input<boolean>(true);
  snapToDataPoint = input<boolean>(false);
  isAnimationActive = input<boolean>(true);
  animationDuration = input<number>(150);
  animationEasing = input<
    'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
  >('ease');

  // Computed properties (input-only)
  shouldShow = computed(() => {
    const active = this.active();
    const payloadLength = this.filteredPayload().length;
    const shouldShow = active && payloadLength > 0;

    return shouldShow;
  });

  filteredPayload = computed(() => {
    let payload = this.payload();

    if (this.filterNull()) {
      payload = payload.filter((item: TooltipPayload) => item.value != null);
    }

    if (this.itemSorter()) {
      payload = [...payload].sort(this.itemSorter()!);
    }

    return payload;
  });

  displayLabel = computed(() => {
    const label = this.label();
    const formatter = this.labelFormatter();

    if (formatter) {
      return formatter(label, this.payload());
    }

    return label;
  });

  // Tooltip dimensions (will be updated by DOM measurement)
  private tooltipWidth = 150; // Default estimate
  private tooltipHeight = 80; // Default estimate

  finalPosition = computed(() => {
    const fixedPos = this.position();
    if (fixedPos) {
      return fixedPos;
    }

    const coord = this.coordinate();
    const offset = this.offset();
    const viewBox = this.viewBox();
    const allowEscape = this.allowEscapeViewBox();

    // recharts-style position calculation
    return this.calculateTooltipPosition({
      coordinate: coord,
      offset,
      tooltipWidth: this.tooltipWidth,
      tooltipHeight: this.tooltipHeight,
      viewBox,
      allowEscape,
    });
  });

  private calculateTooltipPosition({
    coordinate,
    offset,
    tooltipWidth,
    tooltipHeight,
    viewBox,
    allowEscape,
  }: {
    coordinate: { x: number; y: number };
    offset: number;
    tooltipWidth: number;
    tooltipHeight: number;
    viewBox?: TooltipViewBox;
    allowEscape: AllowEscapeViewBox;
  }): { x: number; y: number } {
    const isSnapping = this.snapToDataPoint();

    if (isSnapping && viewBox) {
      // Floating-UI style: compute coords from placement
      // reference = data point, floating = tooltip
      const reference = {
        x: coordinate.x,
        y: coordinate.y,
        width: 0,  // point has no width
        height: 0  // point has no height
      };

      const floating = {
        width: tooltipWidth,
        height: tooltipHeight
      };

      // Default placement: 'bottom' (below data point)
      // bottom: y = reference.y + reference.height (= coordinate.y)
      let x = reference.x + offset;  // offset to the right
      let y = reference.y + offset;  // offset below

      // Check if fits in viewBox
      const fitsBelow = (y + floating.height) <= (viewBox.y + viewBox.height);

      if (!fitsBelow) {
        // Flip to 'top' placement
        y = reference.y - floating.height - offset;
      }


      return { x, y };
    }

    if (isSnapping) {
      // Fallback when no viewBox
      return {
        x: coordinate.x + offset,
        y: coordinate.y - tooltipHeight - offset
      };
    }

    // Normal behavior: offset from cursor
    const negativeX = coordinate.x - tooltipWidth - offset;
    const positiveX = coordinate.x + offset;
    const negativeY = coordinate.y - tooltipHeight - offset;
    const positiveY = coordinate.y + offset;

    let finalX = positiveX;
    let finalY = negativeY;

    // Handle X positioning with viewBox constraints
    if (viewBox && !allowEscape.x) {
      if (positiveX + tooltipWidth > viewBox.x + viewBox.width) {
        // Doesn't fit on right, try left
        if (negativeX >= viewBox.x) {
          finalX = negativeX;
        } else {
          // Doesn't fit on either side, clamp to viewBox
          finalX = Math.max(
            viewBox.x,
            Math.min(positiveX, viewBox.x + viewBox.width - tooltipWidth)
          );
        }
      }
    }

    // Handle Y positioning with viewBox constraints
    if (viewBox && !allowEscape.y) {
      if (negativeY < viewBox.y) {
        // Doesn't fit above, try below
        if (positiveY + tooltipHeight <= viewBox.y + viewBox.height) {
          finalY = positiveY;
        } else {
          // Doesn't fit below either, clamp to viewBox
          finalY = Math.max(
            viewBox.y,
            Math.min(negativeY, viewBox.y + viewBox.height - tooltipHeight)
          );
        }
      }
    }

    return { x: finalX, y: finalY };
  }

  wrapperStyles = computed(() => {
    const position = this.finalPosition();
    const isActive = this.shouldShow();

    return {
      position: 'absolute' as const,
      top: '0px',
      left: '0px',
      'pointer-events': 'none',
      'z-index': isActive ? '1000' : '-1',
      transform: `translate(${position.x}px, ${position.y}px)`,
      transition: this.isAnimationActive()
        ? `transform ${this.animationDuration()}ms ${this.animationEasing()}`
        : 'none',
      display: isActive ? 'block' : 'none',
      ...this.wrapperStyle(),
    };
  });

  contentStyles = computed(() => ({
    margin: '0px',
    padding: '10px',
    'background-color': 'rgb(255, 255, 255)',
    border: '1px solid rgb(204, 204, 204)',
    'white-space': 'nowrap',
    'border-radius': '3px',
    'box-shadow': '0 0 10px rgba(0, 0, 0, 0.1)',
    ...this.contentStyle(),
  }));

  labelStyles = computed(() => ({
    margin: '0px',
    color: 'rgb(102, 102, 102)',
    ...this.labelStyle(),
  }));

  getItemStyle(item: TooltipPayload): Record<string, any> {
    return {
      display: 'block',
      'padding-top': '4px',
      'padding-bottom': '4px',
      color: item.color || '#000',
      ...this.itemStyle(),
    };
  }

  getItemName(item: TooltipPayload): string {
    const formatter = this.formatter();
    if (formatter) {
      const result = formatter(item.value, item.name || item.dataKey, item);
      if (Array.isArray(result)) {
        return result[1] || item.name || item.dataKey;
      }
    }
    return item.name || item.dataKey;
  }

  getItemValue(item: TooltipPayload): string {
    const formatter = this.formatter();
    if (formatter) {
      const result = formatter(item.value, item.name || item.dataKey, item);
      if (Array.isArray(result)) {
        return result[0];
      }
      return result;
    }

    if (typeof item.value === 'number') {
      return item.value.toLocaleString();
    }
    return String(item.value);
  }
}
