import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  effect,
  ElementRef,
  inject,
  Injectable,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
  AfterContentInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from './tooltip.component';
import { TooltipConfigService } from '../services/tooltip-config.service';
import { calculateChartDimensions, getInnerDivStyle } from '../services/responsive-container-utils';
import { ResponsiveContainerService } from '../services/responsive-container.service';



@Component({
  selector: 'ngx-responsive-container',
  standalone: true,
  imports: [CommonModule],
  providers: [
    ResponsiveContainerService,
    TooltipConfigService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #containerRef
      class="recharts-responsive-container"
      [style.width]="width()"
      [style.height]="height()"
      [style.min-width]="minWidth()"
      [style.min-height]="minHeight()"
      [style.max-height]="maxHeight() ? maxHeight() + 'px' : null"
    >
      <div [ngStyle]="innerDivStyle()">
        <!-- recharts 로직: 유효한 크기일 때만 children 렌더링 -->
        @if (isAcceptableSize()) {
          <ng-content></ng-content>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .recharts-responsive-container {
        position: relative;
        cursor: default;
        user-select: none;
      }
    `,
  ],
})
export class ResponsiveContainerComponent implements OnDestroy, AfterContentInit {
  private responsiveService = inject(ResponsiveContainerService);
  private tooltipConfigService = inject(TooltipConfigService);
  private resizeObserver?: ResizeObserver;
  
  @ContentChild(TooltipComponent) tooltipChild?: TooltipComponent;

  // Inputs
  width = input<string | number>('100%');
  height = input<string | number>('100%');
  minWidth = input<string | number>(0);
  minHeight = input<string | number>();
  maxHeight = input<number>();
  aspect = input<number>();
  debounce = input<number>(0);

  // Outputs
  onResize = output<{ width: number; height: number }>();

  // ViewChild
  containerRef = viewChild.required<ElementRef<HTMLDivElement>>('containerRef');

  // Internal state
  private containerWidth = signal<number>(-1);
  private containerHeight = signal<number>(-1);

  // Computed dimensions using recharts logic
  calculatedDimensions = computed(() => {
    const containerW = this.containerWidth();
    const containerH = this.containerHeight();
    
    if (containerW <= 0 || containerH <= 0) {
      return { calculatedWidth: undefined, calculatedHeight: undefined };
    }
    
    return calculateChartDimensions(containerW, containerH, {
      width: this.width(),
      height: this.height(),
      aspect: this.aspect(),
      maxHeight: this.maxHeight(),
    });
  });

  // Inner div style for overflow handling
  innerDivStyle = computed(() => {
    return getInnerDivStyle({
      width: this.width(),
      height: this.height(),
    });
  });

  // recharts 호환: 유효한 크기인지 체크
  isAcceptableSize = computed(() => {
    const dims = this.calculatedDimensions();
    return dims.calculatedWidth != null && dims.calculatedWidth > 0 && 
           dims.calculatedHeight != null && dims.calculatedHeight > 0;
  });

  constructor() {
    // Update service when dimensions change
    effect(() => {
      const dims = this.calculatedDimensions();

      
      // recharts 로직: 유효한 크기만 설정
      if (this.isAcceptableSize()) {
        console.log('✅ ResponsiveContainer setting valid size:', dims.calculatedWidth, 'x', dims.calculatedHeight);
        this.responsiveService.setDimensions(
          dims.calculatedWidth!,
          dims.calculatedHeight!
        );
        
        this.onResize.emit({
          width: dims.calculatedWidth!,
          height: dims.calculatedHeight!,
        });
      } else {
        console.log('❌ ResponsiveContainer setting invalid size (-1, -1)');
        // 유효하지 않은 크기일 때는 -1로 설정 (recharts 패턴)
        this.responsiveService.setDimensions(-1, -1);
      }
    });

    // Setup resize observer
    effect(() => {
      const container = this.containerRef();
      if (container) {
        this.setupResizeObserver(container.nativeElement);
      }
    });
  }

  private setupResizeObserver(element: HTMLElement): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    const callback = (entries: ResizeObserverEntry[]) => {
      const { width, height } = entries[0].contentRect;

      this.containerWidth.set(Math.round(width));
      this.containerHeight.set(Math.round(height));
    };

    this.resizeObserver = new ResizeObserver(callback);

    // Get initial dimensions immediately
    const rect = element.getBoundingClientRect();

    
    // Set initial dimensions immediately if available
    if (rect.width > 0 && rect.height > 0) {
      this.containerWidth.set(Math.round(rect.width));
      this.containerHeight.set(Math.round(rect.height));
    }

    this.resizeObserver.observe(element);
  }

  ngAfterContentInit() {
    if (this.tooltipChild) {
      const config = {
        separator: this.tooltipChild.separator(),
        offset: this.tooltipChild.offset(),
        filterNull: this.tooltipChild.filterNull(),
        snapToDataPoint: this.tooltipChild.snapToDataPoint(),
        isAnimationActive: this.tooltipChild.isAnimationActive(),
        animationDuration: this.tooltipChild.animationDuration(),
      };
      

      this.tooltipConfigService.setConfig(config);
    } else {

    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  getWrapperElement(): HTMLElement {
    return this.containerRef().nativeElement;
  }
}
