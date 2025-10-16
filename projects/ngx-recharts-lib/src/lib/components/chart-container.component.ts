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
      <ng-content></ng-content>
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
  
  constructor() {
    // Layout service will be updated via effects
  }
}