import {
  Component,
  input,
  computed,
  signal,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData } from '../core/types';

export interface TooltipPayload {
  dataKey: string;
  value: any;
  name?: string;
  color?: string;
  payload: ChartData;
}

@Component({
  selector: 'ngx-tooltip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible() && payload().length > 0) {
      <div class="recharts-tooltip-wrapper"
           [style.transform]="'translate(' + position().x + 'px, ' + position().y + 'px)'"
           [style.pointer-events]="'none'"
           [style.visibility]="visible() ? 'visible' : 'hidden'">
        <div class="recharts-default-tooltip"
             [style.margin]="'0px'"
             [style.padding]="'10px'"
             [style.background-color]="'rgb(255, 255, 255)'"
             [style.border]="'1px solid rgb(204, 204, 204)'"
             [style.white-space]="'nowrap'">
          
          @if (label()) {
            <p class="recharts-tooltip-label" 
               [style.margin]="'0px'"
               [style.color]="'rgb(102, 102, 102)'">
              {{ label() }}
            </p>
          }
          
          <ul class="recharts-tooltip-item-list" 
              [style.padding]="'0px'"
              [style.margin]="'0px'">
            @for (item of payload(); track item.dataKey) {
              <li class="recharts-tooltip-item"
                  [style.display]="'block'"
                  [style.padding-top]="'4px'"
                  [style.padding-bottom]="'4px'"
                  [style.color]="item.color || '#000'">
                <span class="recharts-tooltip-item-name">{{ item.name || item.dataKey }}</span>
                <span class="recharts-tooltip-item-separator"> : </span>
                <span class="recharts-tooltip-item-value">{{ formatValue(item.value) }}</span>
              </li>
            }
          </ul>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 1000;
    }
    
    .recharts-tooltip-wrapper {
      position: absolute;
      pointer-events: none;
      transition: transform 0.1s ease-out, opacity 0.1s ease-out;
      opacity: 0;
    }
    
    .recharts-tooltip-wrapper[style*="visible"] {
      opacity: 1;
    }
    
    .recharts-default-tooltip {
      border-radius: 3px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      transform: scale(0.95);
      transition: transform 0.1s ease-out;
    }
    
    .recharts-tooltip-wrapper[style*="visible"] .recharts-default-tooltip {
      transform: scale(1);
    }
    
    .recharts-tooltip-item-list {
      list-style: none;
    }
  `]
})
export class TooltipComponent {
  private elementRef = inject(ElementRef);
  
  // Inputs
  active = input<boolean>(false);
  payload = input<TooltipPayload[]>([]);
  label = input<string>('');
  coordinate = input<{x: number, y: number}>({x: 0, y: 0});
  
  // Computed state
  visible = computed(() => this.active() && this.payload().length > 0);
  position = computed(() => {
    const coord = this.coordinate();
    return {
      x: coord.x + 10,
      y: coord.y - 10
    };
  });
  

  
  formatValue(value: any): string {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  }
}