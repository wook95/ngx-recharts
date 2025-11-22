import { Component, input, computed, signal, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-recharts-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="recharts-wrapper"
      [style]="wrapperStyle()"
      #wrapperElement>
      <ng-content></ng-content>
      
      <!-- Legend portal container -->
      <div #legendPortal class="recharts-legend-portal"></div>
      
      <!-- Tooltip portal container -->
      <div #tooltipPortal class="recharts-tooltip-portal"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .recharts-wrapper {
      position: relative;
      cursor: default;
    }
    
    .recharts-legend-portal {
      position: absolute;
      pointer-events: none;
    }
    
    .recharts-tooltip-portal {
      position: absolute;
      pointer-events: none;
    }
  `]
})
export class RechartsWrapperComponent {
  private elementRef = inject(ElementRef);

  // Inputs
  width = input<number | string>('100%');
  height = input<number | string>('100%');
  className = input<string>('');
  
  // Computed styles
  wrapperStyle = computed(() => ({
    position: 'relative',
    cursor: 'default',
    width: typeof this.width() === 'number' ? `${this.width()}px` : this.width(),
    height: typeof this.height() === 'number' ? `${this.height()}px` : this.height()
  }));

  // Portal elements for Legend and Tooltip
  legendPortal = signal<HTMLElement | null>(null);
  tooltipPortal = signal<HTMLElement | null>(null);

  ngAfterViewInit() {
    const wrapperEl = this.elementRef.nativeElement.querySelector('.recharts-wrapper');
    const legendEl = this.elementRef.nativeElement.querySelector('.recharts-legend-portal');
    const tooltipEl = this.elementRef.nativeElement.querySelector('.recharts-tooltip-portal');
    
    this.legendPortal.set(legendEl);
    this.tooltipPortal.set(tooltipEl);
  }
}