import { Component, input, computed, inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextComponent, TextAnchor, TextVerticalAnchor } from './text.component';
import { ChartLayoutService } from '../services/chart-layout.service';
import { CartesianLabelContextService, PolarLabelContextService } from '../context/label-context.service';
import { cartesianToTrapezoid } from '../core/label-types';

export type LabelPosition = 
  | 'top' | 'left' | 'right' | 'bottom' | 'inside' | 'outside'
  | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom'
  | 'insideTopLeft' | 'insideBottomLeft' | 'insideTopRight' | 'insideBottomRight'
  | 'insideStart' | 'insideEnd' | 'end' | 'center' | 'centerTop' | 'centerBottom' | 'middle'
  | { x?: number; y?: number };

export interface ViewBox {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

@Component({
  selector: 'ngx-label',
  standalone: true,
  imports: [CommonModule, TextComponent],
  template: `
    <svg:text 
      ngx-text
      [x]="labelX()"
      [y]="labelY()"
      [textAnchor]="labelTextAnchor()"
      [verticalAnchor]="labelVerticalAnchor()"
      [fill]="fill()"
      [angle]="angle()"
      [width]="width()"
      [breakAll]="textBreakAll()"
      [className]="'recharts-label ' + (className() || '')"
      [children]="labelText()">
    </svg:text>
  `
})
export class LabelComponent {
  private chartLayoutService = inject(ChartLayoutService);
  private cartesianContext = inject(CartesianLabelContextService, { optional: true });
  private polarContext = inject(PolarLabelContextService, { optional: true });

  // Inputs
  viewBox = input<ViewBox>();
  parentViewBox = input<ViewBox>();
  formatter = input<(label: any) => any>();
  value = input<number | string>();
  offset = input<number>(5);
  position = input<LabelPosition>('center');
  className = input<string>('');
  textBreakAll = input<boolean>(false);
  angle = input<number>();
  width = input<number>();
  fill = input<string>('#666');
  children = input<string | number>();
  content = input<any>(); // React element or function for custom rendering
  id = input<string>(); // Unique id for SSR

  // Get effective viewBox from props, context, or chart layout
  private effectiveViewBox = computed(() => {
    const explicitViewBox = this.viewBox();
    if (explicitViewBox) return explicitViewBox;

    // Try to get from context (polar or cartesian)
    const polarViewBox = this.polarContext?.getViewBox()();
    if (polarViewBox) return polarViewBox;

    const cartesianViewBox = this.cartesianContext?.getViewBox()();
    if (cartesianViewBox) return cartesianViewBox;

    // Fallback to chart layout
    const chartWidth = this.chartLayoutService.chartWidth();
    const chartHeight = this.chartLayoutService.chartHeight();
    const margin = this.chartLayoutService.margin();

    if (chartWidth && chartHeight) {
      return {
        x: margin.left || 0,
        y: margin.top || 0,
        width: chartWidth - (margin.left || 0) - (margin.right || 0),
        height: chartHeight - (margin.top || 0) - (margin.bottom || 0)
      };
    }

    return { x: 0, y: 0, width: 0, height: 0 };
  });

  // Label text
  labelText = computed(() => {
    const children = this.children();
    const value = this.value();
    const formatter = this.formatter();
    
    const text = children !== undefined ? children : value;
    
    if (formatter && text !== undefined) {
      return formatter(text);
    }
    
    return text?.toString() || '';
  });

  // Position calculations
  private positionAttrs = computed(() => {
    const viewBox = this.effectiveViewBox();
    const position = this.position();
    const offset = this.offset();

    if (!viewBox) {
      return { x: 0, y: 0, textAnchor: 'middle' as TextAnchor, verticalAnchor: 'middle' as TextVerticalAnchor };
    }

    // Handle Cartesian viewBox only for now (Polar will be handled in Task 1.4)
    if (!('width' in viewBox)) {
      return { x: 0, y: 0, textAnchor: 'middle' as TextAnchor, verticalAnchor: 'middle' as TextVerticalAnchor };
    }

    const { x = 0, y = 0, width = 0, height = 0 } = viewBox;

    if (width === 0 && height === 0) {
      return { x: 0, y: 0, textAnchor: 'middle' as TextAnchor, verticalAnchor: 'middle' as TextVerticalAnchor };
    }

    if (typeof position === 'object' && 'x' in position) {
      return {
        x: x + (position.x || 0),
        y: y + (position.y || 0),
        textAnchor: 'start' as TextAnchor,
        verticalAnchor: 'start' as TextVerticalAnchor
      };
    }

    switch (position) {
      case 'top':
        return {
          x: x + width / 2,
          y: y - offset,
          textAnchor: 'middle' as TextAnchor,
          verticalAnchor: 'end' as TextVerticalAnchor
        };
      case 'bottom':
        return {
          x: x + width / 2,
          y: y + height + offset,
          textAnchor: 'middle' as TextAnchor,
          verticalAnchor: 'start' as TextVerticalAnchor
        };
      case 'left':
        return {
          x: x - offset,
          y: y + height / 2,
          textAnchor: 'end' as TextAnchor,
          verticalAnchor: 'middle' as TextVerticalAnchor
        };
      case 'right':
        return {
          x: x + width + offset,
          y: y + height / 2,
          textAnchor: 'start' as TextAnchor,
          verticalAnchor: 'middle' as TextVerticalAnchor
        };
      case 'insideLeft':
        return {
          x: x + offset,
          y: y + height / 2,
          textAnchor: 'start' as TextAnchor,
          verticalAnchor: 'middle' as TextVerticalAnchor
        };
      case 'insideRight':
        return {
          x: x + width - offset,
          y: y + height / 2,
          textAnchor: 'end' as TextAnchor,
          verticalAnchor: 'middle' as TextVerticalAnchor
        };
      case 'insideTop':
        return {
          x: x + width / 2,
          y: y + offset,
          textAnchor: 'middle' as TextAnchor,
          verticalAnchor: 'start' as TextVerticalAnchor
        };
      case 'insideBottom':
        return {
          x: x + width / 2,
          y: y + height - offset,
          textAnchor: 'middle' as TextAnchor,
          verticalAnchor: 'end' as TextVerticalAnchor
        };
      case 'insideStart':
        return {
          x: x + offset,
          y: y + height / 2,
          textAnchor: 'start' as TextAnchor,
          verticalAnchor: 'middle' as TextVerticalAnchor
        };
      case 'insideEnd':
        return {
          x: x + width - offset,
          y: y + height / 2,
          textAnchor: 'end' as TextAnchor,
          verticalAnchor: 'middle' as TextVerticalAnchor
        };
      case 'end':
        return {
          x: x + width + offset,
          y: y + height / 2,
          textAnchor: 'start' as TextAnchor,
          verticalAnchor: 'middle' as TextVerticalAnchor
        };
      case 'centerTop':
        return {
          x: x + width / 2,
          y: y + height / 2,
          textAnchor: 'middle' as TextAnchor,
          verticalAnchor: 'start' as TextVerticalAnchor
        };
      case 'centerBottom':
        return {
          x: x + width / 2,
          y: y + height / 2,
          textAnchor: 'middle' as TextAnchor,
          verticalAnchor: 'end' as TextVerticalAnchor
        };
      case 'center':
      case 'middle':
      default:
        return {
          x: x + width / 2,
          y: y + height / 2,
          textAnchor: 'middle' as TextAnchor,
          verticalAnchor: 'middle' as TextVerticalAnchor
        };
    }
  });

  labelX = computed(() => this.positionAttrs().x);
  labelY = computed(() => this.positionAttrs().y);
  labelTextAnchor = computed(() => this.positionAttrs().textAnchor);
  labelVerticalAnchor = computed(() => this.positionAttrs().verticalAnchor);
}