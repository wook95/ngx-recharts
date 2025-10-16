import {
  Component,
  input,
  computed,
  inject,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartLayoutService } from '../services/chart-layout.service';
import { TooltipService } from '../services/tooltip.service';
import { SurfaceComponent } from './surface.component';
import { TooltipComponent } from '../component/tooltip.component';
import { ChartData, ChartMargin, getNumericDataValue } from '../core/types';

@Component({
  selector: 'ngx-chart-container',
  standalone: true,
  imports: [SurfaceComponent, TooltipComponent],
  providers: [TooltipService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="recharts-wrapper" 
         (mousemove)="onMouseMove($event)"
         (mouseleave)="onMouseLeave($event)">
      <ngx-recharts-surface
        [width]="chartWidth()"
        [height]="chartHeight()">
        <!-- Chart background -->
        <svg:rect 
          [attr.width]="chartWidth()" 
          [attr.height]="chartHeight()" 
          fill="#fff" />
        <svg:g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <!-- Plot area background -->
          <svg:rect 
            [attr.width]="plotWidth()" 
            [attr.height]="plotHeight()" 
            fill="white" 
            stroke="#ccc" />
          <ng-content></ng-content>
        </svg:g>
      </ngx-recharts-surface>
      
      <!-- Tooltip -->
      <ngx-tooltip
        [active]="tooltipService.active()"
        [payload]="tooltipService.payload()"
        [label]="tooltipService.label()"
        [coordinate]="tooltipService.coordinate()"></ngx-tooltip>
    </div>
  `,
  styles: [`
    .recharts-wrapper {
      position: relative;
      cursor: default;
      user-select: none;
    }
  `]
})
export class ChartContainerComponent {
  private store = inject(Store);
  private layoutService = inject(ChartLayoutService);
  protected tooltipService = inject(TooltipService);
  private elementRef = inject(ElementRef);
  
  // Inputs
  data = input.required<ChartData[]>();
  width = input<number>(400);
  height = input<number>(400);
  margin = input<ChartMargin>({ top: 5, right: 5, bottom: 5, left: 5 });
  
  // Computed properties
  chartWidth = computed(() => this.width());
  chartHeight = computed(() => this.height());
  
  plotWidth = computed(() => {
    const m = this.margin();
    return this.width() - m.left - m.right;
  });
  
  plotHeight = computed(() => {
    const m = this.margin();
    return this.height() - m.top - m.bottom;
  });
  
  onMouseMove(event: MouseEvent) {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left - this.margin().left;
    const y = event.clientY - rect.top - this.margin().top;
    
    // Check if mouse is within plot area (grid area)
    const plotWidth = this.plotWidth();
    const plotHeight = this.plotHeight();
    
    if (x < 0 || x > plotWidth || y < 0 || y > plotHeight) {
      this.tooltipService.hideTooltip();
      return;
    }
    
    // Find closest data point
    const data = this.data();
    if (data.length === 0) return;
    
    // Find closest x position (snap to data point)
    const dataIndex = Math.round((x / plotWidth) * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));
    
    // Calculate exact X position for this data point (recharts style)
    const exactX = (clampedIndex / Math.max(data.length - 1, 1)) * plotWidth;
    
    const item = data[clampedIndex];
    const payload = [
      {
        dataKey: 'uv',
        value: getNumericDataValue(item, 'uv'),
        name: 'UV',
        color: '#8884d8',
        payload: item
      },
      {
        dataKey: 'pv', 
        value: getNumericDataValue(item, 'pv'),
        name: 'PV',
        color: '#82ca9d',
        payload: item
      }
    ];
    
    // X position snaps to data point, Y follows mouse
    this.tooltipService.showTooltip(
      { 
        x: exactX + this.margin().left, 
        y: event.clientY - rect.top 
      },
      payload,
      String(item['name'] || '')
    );
  }
  
  onMouseLeave(event: MouseEvent) {
    this.tooltipService.hideTooltip();
  }
}