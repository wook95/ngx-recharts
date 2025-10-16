import { Component, input, output, signal, computed, inject, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { setChartDimensions } from '../store/chart.state';

@Component({
  selector: 'ngx-recharts-surface',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      #svgElement
      [attr.width]="width()" 
      [attr.height]="height()"
      [attr.viewBox]="viewBox()"
      class="recharts-surface">
      <ng-content></ng-content>
    </svg>
  `,
  styles: [`
    .recharts-surface {
      overflow: hidden;
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
  
  // Computed viewBox
  viewBox = computed(() => `0 0 ${this.width()} ${this.height()}`);
  
  // Output events
  dimensionsChange = output<{ width: number; height: number }>();
  
  constructor() {
    // Update store when dimensions change using effect
    effect(() => {
      this.store.dispatch(setChartDimensions({ 
        width: this.width(), 
        height: this.height() 
      }));
    });
  }
}