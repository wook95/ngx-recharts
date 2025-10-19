import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
  AfterContentInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartLayoutService } from '../services/chart-layout.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { TooltipComponent } from './tooltip.component';
import { TooltipConfigService } from '../services/tooltip-config.service';


export type Percent = string;

export interface ResponsiveContainerProps {
  width?: Percent | number;
  height?: Percent | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: number;
  aspect?: number;
  debounce?: number;
  initialDimension?: { width: number; height: number };
}

@Component({
  selector: 'ngx-responsive-container',
  standalone: true,
  providers: [
    ResponsiveContainerService,
    TooltipConfigService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #containerRef
      class="recharts-responsive-container"
      [style.width]="containerWidth()"
      [style.height]="containerHeight()"
      [style.min-width]="getMinWidth()"
      [style.min-height]="getMinHeight()"
      [style.max-height.px]="maxHeight()"
    >
      @if (calculatedSize().width > 0 && calculatedSize().height > 0) {
      <div
        #rechartsWrapper
        class="recharts-wrapper"
        [style.width.px]="calculatedSize().width"
        [style.height.px]="calculatedSize().height"
        [style.position]="'relative'"
        [style.cursor]="'default'"
      >
        <ng-content></ng-content>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .recharts-responsive-container {
        width: 100%;
        height: 100%;
        position: relative;
      }
    `,
  ],
})
export class ResponsiveContainerComponent implements OnDestroy, AfterContentInit {
  private store = inject(Store);
  private chartLayoutService = inject(ChartLayoutService);
  private responsiveService = inject(ResponsiveContainerService);
  private tooltipConfigService = inject(TooltipConfigService);
  private injector = inject(Injector);
  private resizeObserver?: ResizeObserver;
  
  @ContentChild(TooltipComponent) tooltipChild?: TooltipComponent;

  // Inputs
  width = input<Percent | number>('100%');
  height = input<Percent | number>('100%');
  minWidth = input<string | number>(0);
  minHeight = input<string | number>();
  maxHeight = input<number>();
  aspect = input<number>();
  debounce = input<number>(0);
  initialDimension = input<{ width: number; height: number }>({
    width: -1,
    height: -1,
  });

  // Outputs
  onResize = output<{ width: number; height: number }>();

  // ViewChild
  containerRef = viewChild.required<ElementRef<HTMLDivElement>>('containerRef');
  rechartsWrapper = viewChild<ElementRef<HTMLDivElement>>('rechartsWrapper');

  // Signals
  private containerSize = signal(this.initialDimension());

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

  getMinWidth = computed(() => {
    const minW = this.minWidth();
    return typeof minW === 'number' ? `${minW}px` : minW;
  });

  getMinHeight = computed(() => {
    const minH = this.minHeight();
    return typeof minH === 'number' ? `${minH}px` : minH;
  });

  calculatedSize = computed(() => {
    const containerSize = this.containerSize();
    const aspectRatio = this.aspect();
    const maxH = this.maxHeight();

    let { width, height } = containerSize;

    // Apply aspect ratio if specified
    if (aspectRatio && width > 0) {
      height = width / aspectRatio;
    }

    // Apply max height constraint
    if (maxH && height > maxH) {
      height = maxH;
      if (aspectRatio) {
        width = height * aspectRatio;
      }
    }

    // Apply minimum constraints
    const minW =
      typeof this.minWidth() === 'number' ? (this.minWidth() as number) : 0;
    const minH =
      typeof this.minHeight() === 'number' ? (this.minHeight() as number) : 0;

    width = Math.max(width, minW);
    height = Math.max(height, minH);

    return { width: Math.round(width), height: Math.round(height) };
  });

  chartHeight = computed(() => {
    return this.calculatedSize().height; // Use full height, Legend will overlay
  });

  // Provide wrapper element for Legend portal
  getWrapperElement(): HTMLElement | null {
    return this.rechartsWrapper()?.nativeElement || null;
  }

  constructor() {
    // Effect to setup resize observer
    effect(() => {
      const container = this.containerRef();
      if (container) {
        this.setupResizeObserver(container.nativeElement);
      }
    });

    // Effect to update responsive service when size changes
    effect(() => {
      const size = this.calculatedSize();
      if (size.width > 0 && size.height > 0) {
        this.responsiveService.setDimensions(size.width, size.height);
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
    this.containerSize.set({ width, height });
  }

  private cleanupResizeObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
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
      
      console.log('🎯 ResponsiveContainer setting tooltip config:', config);
      this.tooltipConfigService.setConfig(config);
    } else {
      console.log('❌ ResponsiveContainer no tooltip child found');
    }
  }

  ngOnDestroy(): void {
    this.cleanupResizeObserver();
  }
}
