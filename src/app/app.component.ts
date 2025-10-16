import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { SurfaceComponent } from '../../projects/ngx-recharts-lib/src/lib/components/surface.component';
import { ChartLayoutService } from '../../projects/ngx-recharts-lib/src/lib/services/chart-layout.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SurfaceComponent],
  template: `
    <div class="container">
      <h1>NGX Recharts Demo</h1>
      
      <div class="chart-container">
        <ngx-recharts-surface [width]="400" [height]="300">
          <!-- SVG content will go here -->
        </ngx-recharts-surface>
      </div>
      
      <div class="info">
        <h3>Chart Layout Info:</h3>
        <p>Width: {{ layoutService.width() }}</p>
        <p>Height: {{ layoutService.height() }}</p>
        <p>Plot Area: {{ layoutService.plotArea() | json }}</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .chart-container {
      margin: 20px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 20px;
      background: #f9f9f9;
    }
    
    .info {
      margin-top: 20px;
      padding: 15px;
      background: #f0f0f0;
      border-radius: 4px;
      
      h3 {
        margin-top: 0;
      }
      
      p {
        margin: 5px 0;
        font-family: monospace;
      }
    }
  `]
})
export class AppComponent {
  layoutService = inject(ChartLayoutService);
}