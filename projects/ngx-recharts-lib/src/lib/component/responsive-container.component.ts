import {
  Component,
  input,
  output,
  viewChild,
  effect,
  inject,
  ElementRef,
  signal,
  computed,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { chartActions } from '../store/chart.state';

export interface ResponsiveContainerProps {
  width?: number | string;
  height?: number | string;
  minWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspect?: number;
  debounce?: number;
}

@Component({
  selector: 'ngx-responsive-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      #containerRef
      class="recharts-responsive-container"
      [style.width]="containerWidth()"
      [style.height]="containerHeight()"
      [style.min-width.px]="minWidth()"
      [style.min-height.px]="minHeight()"
      [style.max-height.px]="maxHeight()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .recharts-responsive-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
  `]
})
export class ResponsiveContainerComponent implements OnDestroy {
  private store = inject(Store);
  private resizeObserver?: ResizeObserver;
  
  // Inputs
  width = input<number | string>('100%');
  height = input<number | string>('100%');
  minWidth = input<number>(0);
  minHeight = input<number>(0);
  maxHeight = input<number>();
  aspect = input<number>();
  debounce = input<number>(0);
  
  // Outputs
  onResize = output<{ width: number; height: number }>();
  
  // ViewChild
  containerRef = viewChild.required<ElementRef<HTMLDivElement>>('containerRef');
  
  // Signals
  private containerSize = signal({ width: 0, height: 0 });
  
  // Computed properties
  containerWidth = computed(() => {
    const w = this.width();
    return typeof w === 'number' ? `${w}px` : w;
  });
  
  containerHeight = computed(() => {
    const h = this.height();
    const aspectRatio = this.aspect();
    
    if (aspectRatio && typeof this.width() === 'number') {
      return `${(this.width() as number) / aspectRatio}px`;
    }
    
    return typeof h === 'number' ? `${h}px` : h;
  });
  
  constructor() {
    // Effect to setup resize observer
    effect(() => {
      const container = this.containerRef();
      if (container) {
        this.setupResizeObserver(container.nativeElement);
      }
    });
    
    // Effect to update store when size changes
    effect(() => {
      const size = this.containerSize();
      if (size.width > 0 && size.height > 0) {
        this.store.dispatch(chartActions.setDimensions({
          width: size.width,
          height: size.height
        }));
        this.onResize.emit(size);
      }
    });
  }
  
  private setupResizeObserver(element: HTMLElement): void {
    this.cleanupResizeObserver();
    
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        
        // Apply debounce if specified
        const debounceTime = this.debounce();
        if (debounceTime > 0) {
          setTimeout(() => {
            this.updateSize(width, height);
          }, debounceTime);
        } else {
          this.updateSize(width, height);
        }
      }
    });
    
    this.resizeObserver.observe(element);
    
    // Initial size calculation
    const rect = element.getBoundingClientRect();
    this.updateSize(rect.width, rect.height);
  }
  
  private updateSize(width: number, height: number): void {
    const minW = this.minWidth();
    const minH = this.minHeight();
    const maxH = this.maxHeight();
    
    const finalWidth = Math.max(width, minW);
    let finalHeight = Math.max(height, minH);
    
    if (maxH && finalHeight > maxH) {
      finalHeight = maxH;
    }
    
    this.containerSize.set({
      width: finalWidth,
      height: finalHeight
    });
  }
  
  private cleanupResizeObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }
  
  ngOnDestroy(): void {
    this.cleanupResizeObserver();
  }
}