import {
  Directive,
  input,
  computed,
  inject,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy
} from '@angular/core';
import { TooltipService } from '../services/tooltip.service';
import { TooltipPayload } from './tooltip.component';
import { TooltipFormatter, LabelFormatter } from '../core/tooltip-types';

@Directive({
  selector: '[ngxTooltip]',
  standalone: true
})
export class TooltipDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private tooltipService = inject(TooltipService);
  
  // recharts API properties
  separator = input<string>(' : ');
  offset = input<number>(10);
  formatter = input<TooltipFormatter | undefined>(undefined);
  labelFormatter = input<LabelFormatter | undefined>(undefined);
  contentStyle = input<Record<string, any>>({});
  labelStyle = input<Record<string, any>>({});
  
  private tooltipElement?: HTMLElement;
  
  constructor() {
    console.log('🎯 TooltipDirective created with service access');
  }
  
  ngOnInit() {
    // Create tooltip element
    this.createTooltipElement();
    
    // Subscribe to tooltip service state
    this.setupTooltipUpdates();
  }
  
  ngOnDestroy() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
    }
  }
  
  private createTooltipElement() {
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'recharts-tooltip-wrapper');
    this.renderer.setStyle(this.tooltipElement, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'hidden');
    this.renderer.appendChild(document.body, this.tooltipElement);
  }
  
  private setupTooltipUpdates() {
    // Use effect to watch service state changes
    const updateTooltip = () => {
      if (!this.tooltipElement) return;
      
      const active = this.tooltipService.active();
      const payload = this.tooltipService.payload();
      const label = this.tooltipService.label();
      const coordinate = this.tooltipService.coordinate();
      
      if (active && payload.length > 0) {
        this.showTooltip(coordinate, payload, label);
      } else {
        this.hideTooltip();
      }
    };
    
    // Simple polling for now (in real app, use proper reactive pattern)
    setInterval(updateTooltip, 16); // 60fps
  }
  
  private showTooltip(coordinate: {x: number, y: number}, payload: TooltipPayload[], label: string) {
    if (!this.tooltipElement) return;
    
    // Position tooltip
    const offset = this.offset();
    this.renderer.setStyle(this.tooltipElement, 'left', `${coordinate.x + offset}px`);
    this.renderer.setStyle(this.tooltipElement, 'top', `${coordinate.y - offset}px`);
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'visible');
    
    // Generate content
    const content = this.generateTooltipContent(payload, label);
    this.tooltipElement.innerHTML = content;
  }
  
  private hideTooltip() {
    if (!this.tooltipElement) return;
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'hidden');
  }
  
  private generateTooltipContent(payload: TooltipPayload[], label: string): string {
    const contentStyles = this.getContentStyles();
    const labelStyles = this.getLabelStyles();
    
    let html = `<div class="recharts-default-tooltip" style="${this.stylesToString(contentStyles)}">`;
    
    // Label
    if (label) {
      const displayLabel = this.labelFormatter() ? 
        this.labelFormatter()!(label, payload) : label;
      html += `<p class="recharts-tooltip-label" style="${this.stylesToString(labelStyles)}">${displayLabel}</p>`;
    }
    
    // Items
    html += '<ul class="recharts-tooltip-item-list" style="padding: 0; margin: 0; list-style: none;">';
    payload.forEach(item => {
      const name = this.getItemName(item);
      const value = this.getItemValue(item);
      html += `<li style="display: block; padding: 4px 0; color: ${item.color || '#000'};">`;
      html += `<span>${name}</span>`;
      html += `<span>${this.separator()}</span>`;
      html += `<span>${value}</span>`;
      html += '</li>';
    });
    html += '</ul></div>';
    
    return html;
  }
  
  private getContentStyles(): Record<string, any> {
    return {
      margin: '0px',
      padding: '10px',
      'background-color': 'rgb(255, 255, 255)',
      border: '1px solid rgb(204, 204, 204)',
      'white-space': 'nowrap',
      'border-radius': '3px',
      'box-shadow': '0 0 10px rgba(0, 0, 0, 0.1)',
      ...this.contentStyle()
    };
  }
  
  private getLabelStyles(): Record<string, any> {
    return {
      margin: '0px',
      color: 'rgb(102, 102, 102)',
      ...this.labelStyle()
    };
  }
  
  private getItemName(item: TooltipPayload): string {
    const formatter = this.formatter();
    if (formatter) {
      const result = formatter(item.value, item.name || item.dataKey, item);
      if (Array.isArray(result)) {
        return result[1] || item.name || item.dataKey;
      }
    }
    return item.name || item.dataKey;
  }
  
  private getItemValue(item: TooltipPayload): string {
    const formatter = this.formatter();
    if (formatter) {
      const result = formatter(item.value, item.name || item.dataKey, item);
      if (Array.isArray(result)) {
        return result[0];
      }
      return result;
    }
    
    if (typeof item.value === 'number') {
      return item.value.toLocaleString();
    }
    return String(item.value);
  }
  
  private stylesToString(styles: Record<string, any>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }
}