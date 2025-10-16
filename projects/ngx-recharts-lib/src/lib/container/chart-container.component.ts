import {
  Component,
  input,
  computed,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartLayoutService } from '../services/chart-layout.service';
import { SurfaceComponent } from './surface.component';
import { ChartData, ChartMargin } from '../core/types';

@Component({
  selector: 'ngx-chart-container',
  standalone: true,
  imports: [SurfaceComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-recharts-surface
      [width]="chartWidth()"
      [height]="chartHeight()"
      class="recharts-wrapper">
      <!-- Debug background -->
      <svg:rect 
        [attr.width]="chartWidth()" 
        [attr.height]="chartHeight()" 
        fill="#f9f9f9" 
        stroke="#ddd" />
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
  

}