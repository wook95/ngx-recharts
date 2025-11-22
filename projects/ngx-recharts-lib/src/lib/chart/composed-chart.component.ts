import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  ContentChildren,
  QueryList,
  AfterContentInit,
  Injector,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartContainerComponent } from '../container/chart-container.component';
import { ChartData } from '../core/types';
import { ScaleService } from '../services/scale.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipService } from '../services/tooltip.service';
import { CHART_LAYOUT, useChartLayout } from '../context/chart-layout.context';
import { CHART_DATA, useChartData } from '../context/chart-data.context';
import { Store } from '@ngrx/store'; // Assuming Store is from ngrx/store

@Component({
  selector: 'ngx-composed-chart',
  standalone: true,
  imports: [CommonModule, ChartContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TooltipService,
    { provide: CHART_LAYOUT, useFactory: useChartLayout },
    { provide: CHART_DATA, useFactory: useChartData }
  ],
  template: `
    <ngx-chart-container
      [width]="actualWidth()"
      [height]="actualHeight()"
      [margin]="margin()"
      [data]="data()"
      [chartType]="'composed'"
      [layout]="layout()"
      [barCategoryGap]="barCategoryGap()"
      [barGap]="barGap()"
      [barSize]="barSize()"
      [reverseStackOrder]="reverseStackOrder()"
      [baseValue]="baseValue()"
      (click)="handleClick($event)"
      (mouseenter)="handleMouseEnter($event)"
      (mousemove)="handleMouseMove($event)"
      (mouseleave)="handleMouseLeave($event)"
      (dblclick)="handleDoubleClick($event)"
      (contextmenu)="handleContextMenu($event)">
      <ng-content></ng-content>
    </ngx-chart-container>

  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class ComposedChartComponent implements AfterContentInit {
  private injector = inject(Injector);
  private store = inject(Store);
  private chartLayout = inject(CHART_LAYOUT);
  private chartDataContext = inject(CHART_DATA);
  private responsiveService = inject(ResponsiveContainerService, { optional: true });
  private tooltipService = inject(TooltipService, { optional: true });

  // Core recharts API inputs
  layout = input<'horizontal' | 'vertical'>('horizontal');
  syncId = input<string | undefined>(undefined);
  syncMethod = input<'index' | 'value' | Function>('index');
  
  // Dimensions
  width = input<number>(800);
  height = input<number>(400);
  
  // Data
  data = input.required<ChartData[]>();
  
  // Margins
  margin = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
  });

  // Bar configuration
  barCategoryGap = input<string | number>('10%');
  barGap = input<number>(4);
  barSize = input<number | undefined>(undefined);
  reverseStackOrder = input<boolean>(false);
  
  // Base value for areas
  baseValue = input<number | 'dataMin' | 'dataMax' | 'auto'>('auto');

  // Event outputs
  onClick = output<any>();
  onMouseEnter = output<any>();
  onMouseMove = output<any>();
  onMouseLeave = output<any>();
  onDoubleClick = output<any>();
  onContextMenu = output<any>();

  // Use responsive dimensions if available, otherwise fall back to props
  actualWidth = computed(() => {
    if (this.responsiveService) {
      const width = this.responsiveService.width();
      // Use ResponsiveContainer size if it's valid (> 10 to avoid tiny sizes)
      const result = width > 10 ? width : this.width();

      return result;
    }
    return this.width();
  });
  
  actualHeight = computed(() => {
    if (this.responsiveService) {
      const height = this.responsiveService.height();
      // Use ResponsiveContainer size if it's valid (> 10 to avoid tiny sizes)
      const result = height > 10 ? height : this.height();

      return result;
    }
    return this.height();
  });

  ngAfterContentInit() {
    // Sync data to context
    effect(() => {
      this.chartDataContext.setData(this.data());
    }, { injector: this.injector });
  }

  // Event handlers
  handleClick(event: any) {
    this.onClick.emit(event);
  }

  handleMouseEnter(event: any) {
    this.onMouseEnter.emit(event);
  }

  handleMouseMove(event: any) {
    this.onMouseMove.emit(event);
  }

  handleMouseLeave(event: any) {
    this.onMouseLeave.emit(event);
  }

  handleDoubleClick(event: any) {
    this.onDoubleClick.emit(event);
  }

  handleContextMenu(event: any) {
    this.onContextMenu.emit(event);
  }
}