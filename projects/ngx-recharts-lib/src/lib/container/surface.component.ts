import { Component, input, output, signal, computed, inject, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { setChartDimensions } from '../store/chart.state';
import { ResponsiveContainerService } from '../services/responsive-container.service';

@Component({
  selector: 'ngx-recharts-surface',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      #svgElement
      [attr.width]="actualWidth()" 
      [attr.height]="actualHeight()"
      [attr.viewBox]="viewBox()"
      [style.display]="'block'"
      class="recharts-surface">
      <ng-content></ng-content>
    </svg>
  `,
  styles: [`
    :host {
      display: block;
    }
    .recharts-surface {
      overflow: hidden;
      display: block;
    }
  `]
})
export class SurfaceComponent {
  private store = inject(Store);

  
  // Inputs using new signal-based inputs
  width = input<number>(0);
  height = input<number>(0);
  
  // ViewChild using new signal-based viewChild
  svgElement = viewChild<ElementRef<SVGSVGElement>>('svgElement');
  
  // Actual dimensions - use inputs directly
  actualWidth = computed(() => this.width());
  actualHeight = computed(() => this.height());

  // Computed viewBox
  viewBox = computed(() => `0 0 ${this.actualWidth()} ${this.actualHeight()}`);
  
  // Output events
  dimensionsChange = output<{ width: number; height: number }>();
  
  constructor() {
    // Update store when dimensions change using effect
    effect(() => {
      this.store.dispatch(setChartDimensions({ 
        width: this.actualWidth(), 
        height: this.actualHeight() 
      }));
    });
  }
}