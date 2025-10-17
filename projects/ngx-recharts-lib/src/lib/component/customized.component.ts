import { 
  Component, 
  input, 
  TemplateRef, 
  ViewContainerRef, 
  inject, 
  effect,
  Type,
  ComponentRef,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type CustomizedComponent = Type<any> | TemplateRef<any>;

@Component({
  selector: 'svg:g[ngx-customized]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg:g class="recharts-customized-wrapper">
      <!-- Dynamic content will be inserted here -->
    </svg:g>
  `
})
export class CustomizedComponent implements OnDestroy {
  private viewContainerRef = inject(ViewContainerRef);
  private componentRef?: ComponentRef<any>;

  // Inputs
  component = input.required<CustomizedComponent>();
  props = input<Record<string, any>>({});

  constructor() {
    // Effect to render the custom component when inputs change
    effect(() => {
      this.renderCustomComponent();
    });
  }

  private renderCustomComponent(): void {
    // Clear previous component
    this.clearComponent();

    const component = this.component();
    const props = this.props();

    if (!component) return;

    try {
      if (this.isComponentType(component)) {
        // Render Angular component
        this.componentRef = this.viewContainerRef.createComponent(component);
        
        // Set input properties
        Object.keys(props).forEach(key => {
          if (this.componentRef?.instance.hasOwnProperty(key)) {
            this.componentRef.instance[key] = props[key];
          }
        });

        // Trigger change detection
        this.componentRef.changeDetectorRef.detectChanges();
      } else if (this.isTemplateRef(component)) {
        // Render template
        this.viewContainerRef.createEmbeddedView(component, props);
      }
    } catch (error) {
      console.warn('Customized component render error:', error);
    }
  }

  private clearComponent(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
    this.viewContainerRef.clear();
  }

  private isComponentType(component: any): component is Type<any> {
    return typeof component === 'function' && component.prototype;
  }

  private isTemplateRef(component: any): component is TemplateRef<any> {
    return component instanceof TemplateRef;
  }

  ngOnDestroy(): void {
    this.clearComponent();
  }
}