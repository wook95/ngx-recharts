import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponsiveContainerComponent } from '../../projects/ngx-recharts-lib/src/lib/components/responsive-container.component';
import { LineChartComponent } from '../../projects/ngx-recharts-lib/src/lib/components/line-chart.component';
import { ChartLayoutService } from '../../projects/ngx-recharts-lib/src/lib/services/chart-layout.service';
import { ChartData } from '../../projects/ngx-recharts-lib/src/lib/core/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ResponsiveContainerComponent, LineChartComponent],
  template: `
    <div class="container">
      <h1>NGX Recharts Demo</h1>
      
      <div class="chart-container">
        <ngx-responsive-container>
          <ngx-line-chart [data]="chartData" [width]="600" [height]="300">
            <!-- Chart elements will go here -->
          </ngx-line-chart>
        </ngx-responsive-container>
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
  
  chartData: ChartData[] = [
    { name: 'Page A', uv: 400, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 300, pv: 4567, amt: 2400 },
    { name: 'Page C', uv: 300, pv: 1398, amt: 2400 },
    { name: 'Page D', uv: 200, pv: 9800, amt: 2400 },
    { name: 'Page E', uv: 278, pv: 3908, amt: 2400 },
    { name: 'Page F', uv: 189, pv: 4800, amt: 2400 }
  ];
}