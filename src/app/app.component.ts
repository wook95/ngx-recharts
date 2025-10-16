import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LineChartComponent } from '../../projects/ngx-recharts-lib/src/lib/chart/line-chart.component';
import { BarChartComponent } from '../../projects/ngx-recharts-lib/src/lib/chart/bar-chart.component';
import { AreaChartComponent } from '../../projects/ngx-recharts-lib/src/lib/chart/area-chart.component';
import { BarComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/bar.component';
import { LineComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/line.component';
import { AreaComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/area.component';
import { XAxisComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/x-axis.component';
import { YAxisComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/y-axis.component';
import { CartesianGridComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/cartesian-grid.component';
import { ResponsiveContainerComponent } from '../../projects/ngx-recharts-lib/src/lib/component/responsive-container.component';
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
    AreaChartComponent,
    BarComponent,
    LineComponent,
    AreaComponent,
    XAxisComponent,
    YAxisComponent,
    CartesianGridComponent,
    TestChartComponent,
  ],
  template: `
    <div class="container">
      <h1>NGX Recharts Demo</h1>

      <div class="chart-container">
        <h2>Line Chart (Recharts Style)</h2>
        <ngx-line-chart
          [data]="chartData"
          [width]="600"
          [height]="400">
          <svg:g ngx-cartesian-grid 
            [width]="600 - 60 - 30" 
            [height]="400 - 20 - 40" 
            strokeDasharray="3 3"></svg:g>
          <svg:g [attr.transform]="'translate(0,' + (400 - 20 - 40) + ')'">
            <svg:g ngx-x-axis 
              [data]="chartData"
              [axisWidth]="600 - 60 - 30"
              dataKey="name"></svg:g>
          </svg:g>
          <svg:g ngx-y-axis 
            [data]="chartData"
            [axisHeight]="400 - 20 - 40"
            dataKey="uv"></svg:g>
          <svg:g ngx-line 
            [data]="chartData"
            [chartWidth]="600 - 60 - 30"
            [chartHeight]="400 - 20 - 40"
            [margin]="{top: 0, right: 0, bottom: 0, left: 0}"
            dataKey="uv" 
            stroke="#8884d8"></svg:g>
        </ngx-line-chart>
      </div>

      <div class="chart-container">
        <h2>Bar Chart (Recharts Style)</h2>
        <ngx-bar-chart
          [data]="chartData"
          [width]="600"
          [height]="400">
          <svg:g ngx-cartesian-grid 
            [width]="600 - 60 - 30" 
            [height]="400 - 20 - 40" 
            strokeDasharray="3 3"></svg:g>
          <svg:g [attr.transform]="'translate(0,' + (400 - 20 - 40) + ')'">
            <svg:g ngx-x-axis 
              [data]="chartData"
              [axisWidth]="600 - 60 - 30"
              dataKey="name"></svg:g>
          </svg:g>
          <svg:g ngx-y-axis 
            [data]="chartData"
            [axisHeight]="400 - 20 - 40"
            dataKey="uv"></svg:g>
          <svg:g ngx-bar 
            [data]="chartData"
            [chartWidth]="600 - 60 - 30"
            [chartHeight]="400 - 20 - 40"
            [margin]="{top: 0, right: 0, bottom: 0, left: 0}"
            dataKey="uv" 
            fill="#8884d8"></svg:g>
          <svg:g ngx-bar 
            [data]="chartData"
            [chartWidth]="600 - 60 - 30"
            [chartHeight]="400 - 20 - 40"
            [margin]="{top: 0, right: 0, bottom: 0, left: 0}"
            dataKey="pv" 
            fill="#82ca9d"></svg:g>
        </ngx-bar-chart>
      </div>

      <div class="chart-container">
        <h2>Area Chart (Recharts Style with Gradients)</h2>
        <ngx-area-chart
          [data]="chartData"
          [width]="600"
          [height]="400"
          [margin]="{top: 10, right: 30, left: 0, bottom: 0}">
          
          <!-- SVG Definitions for Gradients -->
          <svg:defs>
            <svg:linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <svg:stop offset="5%" stop-color="#8884d8" stop-opacity="0.8"></svg:stop>
              <svg:stop offset="95%" stop-color="#8884d8" stop-opacity="0"></svg:stop>
            </svg:linearGradient>
            <svg:linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <svg:stop offset="5%" stop-color="#82ca9d" stop-opacity="0.8"></svg:stop>
              <svg:stop offset="95%" stop-color="#82ca9d" stop-opacity="0"></svg:stop>
            </svg:linearGradient>
          </svg:defs>
          
          <svg:g ngx-x-axis 
            [data]="chartData"
            [axisWidth]="600 - 30"
            dataKey="name"></svg:g>
          <svg:g ngx-y-axis 
            [data]="chartData"
            [axisHeight]="400 - 10"
            dataKey="uv"></svg:g>
          <svg:g ngx-cartesian-grid 
            [width]="600 - 30" 
            [height]="400 - 10" 
            strokeDasharray="3 3"></svg:g>
          
          <!-- Multiple Area components -->
          <svg:g ngx-area 
            [data]="chartData"
            [chartWidth]="600 - 30"
            [chartHeight]="400 - 10"
            [margin]="{top: 0, right: 0, bottom: 0, left: 0}"
            dataKey="uv" 
            type="monotone"
            stroke="#8884d8"
            fill="url(#colorUv)"
            [fillOpacity]="1"></svg:g>
          <svg:g ngx-area 
            [data]="chartData"
            [chartWidth]="600 - 30"
            [chartHeight]="400 - 10"
            [margin]="{top: 0, right: 0, bottom: 0, left: 0}"
            dataKey="pv" 
            type="monotone"
            stroke="#82ca9d"
            fill="url(#colorPv)"
            [fillOpacity]="1"></svg:g>
        </ngx-area-chart>
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
