import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LineChartComponent } from '../../projects/ngx-recharts-lib/src/lib/components/line-chart.component';
import { BarChartComponent } from '../../projects/ngx-recharts-lib/src/lib/components/bar-chart.component';
import { ResponsiveContainerComponent } from '../../projects/ngx-recharts-lib/src/lib/components/responsive-container.component';
import { ChartData, getDataValue } from '../../projects/ngx-recharts-lib/src/lib/core/types';
import { ChartLayoutService } from '../../projects/ngx-recharts-lib/src/lib/services/chart-layout.service';
import { TestChartComponent } from './test-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ResponsiveContainerComponent,
    LineChartComponent,
    BarChartComponent,
    TestChartComponent,
  ],
  template: `
    <div class="container">
      <h1>NGX Recharts Demo</h1>

      <div class="chart-container">
        <h2>Line Chart</h2>
        <ngx-line-chart
          [data]="chartData"
          [dataKey]="'uv'"
          [width]="600"
          [height]="400"
          [stroke]="'#8884d8'"
          [xAxisLabel]="'Pages'"
          [yAxisLabel]="'Unique Visitors'"
        >
        </ngx-line-chart>
      </div>

      <div class="chart-container">
        <h2>Bar Chart</h2>
        <ngx-bar-chart
          [data]="chartData"
          [dataKey]="'uv'"
          [width]="600"
          [height]="400"
          [fill]="'#82ca9d'"
          [xAxisLabel]="'Pages'"
          [yAxisLabel]="'Unique Visitors'"
        >
        </ngx-bar-chart>
      </div>

      <div class="info">
        <h3>Chart Data:</h3>
        <p>Data points: {{ chartData.length }}</p>
        <p>Data key: uv</p>
        <p>Sample values: {{ getSampleValues() }}...</p>
      </div>

      <app-test-chart></app-test-chart>
    </div>
  `,
  styles: [
    `
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
    `,
  ],
})
export class AppComponent {
  layoutService = inject(ChartLayoutService);

  chartData: ChartData[] = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  ];

  getSampleValues(): string {
    return this.chartData
      .slice(0, 3)
      .map((d) => getDataValue(d, 'uv'))
      .join(', ');
  }
}
