import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LegendPayload, LegendAlign, LegendVerticalAlign, LegendLayout } from './legend.component';

@Component({
  selector: 'ngx-default-legend-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul class="recharts-default-legend" [style]="listStyle()">
      <li 
        *ngFor="let entry of payload(); let i = index"
        class="recharts-legend-item"
        [class.inactive]="entry.inactive"
        [style]="itemStyle()"
        (click)="handleClick(entry, i, $event)"
        (mouseenter)="handleMouseEnter(entry, i, $event)"
        (mouseleave)="handleMouseLeave(entry, i, $event)">
        
        <svg 
          [attr.width]="iconSize()"
          [attr.height]="iconSize()"
          [attr.viewBox]="'0 0 32 32'"
          [style]="svgStyle()">
            <!-- Line icon -->
            <svg:line 
              *ngIf="getIconType(entry) === 'plainline'"
              [attr.stroke-width]="4"
              fill="none"
              [attr.stroke]="getColor(entry)"
              [attr.stroke-dasharray]="entry.payload?.strokeDasharray"
              x1="0" y1="16" x2="32" y2="16"
              class="recharts-legend-icon" />
            
            <!-- Curved line icon -->
            <svg:path 
              *ngIf="getIconType(entry) === 'line'"
              [attr.stroke-width]="4"
              fill="none"
              [attr.stroke]="getColor(entry)"
              d="M0,16h10.67A5.33,5.33,0,1,1,21.33,16H32M21.33,16A5.33,5.33,0,1,1,10.67,16"
              class="recharts-legend-icon" />
            
            <!-- Rectangle icon -->
            <svg:path 
              *ngIf="getIconType(entry) === 'rect'"
              stroke="none"
              [attr.fill]="getColor(entry)"
              d="M0,4h32v24h-32z"
              class="recharts-legend-icon" />
            
            <!-- Circle icon -->
            <svg:circle 
              *ngIf="getIconType(entry) === 'circle'"
              [attr.fill]="getColor(entry)"
              cx="16" cy="16" r="8"
              class="recharts-legend-icon" />
            
            <!-- Square icon -->
            <svg:rect 
              *ngIf="getIconType(entry) === 'square'"
              [attr.fill]="getColor(entry)"
              x="8" y="8" width="16" height="16"
              class="recharts-legend-icon" />
        </svg>
        
        <span 
          class="recharts-legend-item-text" 
          [style.color]="getColor(entry)">
          {{ getFormattedValue(entry, i) }}
        </span>
      </li>
    </ul>
  `,
  styles: [`
    .recharts-default-legend {
      padding: 0;
      margin: 0;
      list-style: none;
    }
    
    .recharts-legend-item {
      display: inline-block;
      margin-right: 10px;
      vertical-align: middle;
    }
    
    .recharts-legend-item.inactive {
      opacity: 0.6;
    }
    
    .recharts-legend-item-text {
      margin-left: 4px;
      vertical-align: middle;
    }
  `]
})
export class DefaultLegendContentComponent {
  // Inputs
  payload = input<LegendPayload[]>([]);
  layout = input<LegendLayout>('horizontal');
  align = input<LegendAlign>('center');
  verticalAlign = input<LegendVerticalAlign>('middle');
  iconSize = input<number>(14);
  iconType = input<'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye'>();
  inactiveColor = input<string>('#ccc');
  formatter = input<(value: any, entry: LegendPayload, index: number) => any>();
  
  // Event handlers
  onClick = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();
  onMouseEnter = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();
  onMouseLeave = input<(data: LegendPayload, index: number, event: MouseEvent) => void>();

  // Computed styles
  listStyle = computed(() => ({
    padding: '0',
    margin: '0',
    textAlign: this.layout() === 'horizontal' ? this.align() : 'left'
  }));

  itemStyle = computed(() => ({
    display: this.layout() === 'horizontal' ? 'inline-block' : 'block',
    marginRight: '10px'
  }));

  svgStyle = computed(() => ({
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: '4px'
  }));

  getIconType(entry: LegendPayload): string {
    return this.iconType() ?? entry.type ?? 'rect';
  }

  getColor(entry: LegendPayload): string {
    return entry.inactive ? this.inactiveColor() : (entry.color || '#8884d8');
  }

  getFormattedValue(entry: LegendPayload, index: number): any {
    const formatter = entry.formatter || this.formatter();
    return formatter ? formatter(entry.value, entry, index) : entry.value;
  }
  
  handleClick(entry: LegendPayload, index: number, event: MouseEvent): void {
    const clickHandler = this.onClick();
    if (clickHandler) {
      clickHandler(entry, index, event);
    }
  }
  
  handleMouseEnter(entry: LegendPayload, index: number, event: MouseEvent): void {
    const enterHandler = this.onMouseEnter();
    if (enterHandler) {
      enterHandler(entry, index, event);
    }
  }
  
  handleMouseLeave(entry: LegendPayload, index: number, event: MouseEvent): void {
    const leaveHandler = this.onMouseLeave();
    if (leaveHandler) {
      leaveHandler(entry, index, event);
    }
  }
}