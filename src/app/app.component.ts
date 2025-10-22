import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AreaComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/area.component';
import { BarComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/bar.component';
import { CartesianGridComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/cartesian-grid.component';
import { LineComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/line.component';
import { XAxisComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/x-axis.component';
import { YAxisComponent } from '../../projects/ngx-recharts-lib/src/lib/cartesian/y-axis.component';
import { AreaChartComponent } from '../../projects/ngx-recharts-lib/src/lib/chart/area-chart.component';
import { BarChartComponent } from '../../projects/ngx-recharts-lib/src/lib/chart/bar-chart.component';
import { LineChartComponent } from '../../projects/ngx-recharts-lib/src/lib/chart/line-chart.component';
import { LabelComponent } from '../../projects/ngx-recharts-lib/src/lib/component/label.component';
import {
  LegendComponent,
  LegendPayload,
} from '../../projects/ngx-recharts-lib/src/lib/component/legend.component';
import { ResponsiveContainerComponent } from '../../projects/ngx-recharts-lib/src/lib/component/responsive-container.component';
import { TextComponent } from '../../projects/ngx-recharts-lib/src/lib/component/text.component';
import { TooltipComponent } from '../../projects/ngx-recharts-lib/src/lib/component/tooltip.component';
import {
  ChartData,
  getDataValue,
} from '../../projects/ngx-recharts-lib/src/lib/core/types';
import { ChartLayoutService } from '../../projects/ngx-recharts-lib/src/lib/services/chart-layout.service';

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
    LegendComponent,
    TextComponent,
    LabelComponent,
    TooltipComponent,
  ],
  template: `
    <div class="container">
      <h1>NGX Recharts Demo</h1>

      <div class="chart-container">
        <h2>Line Chart - X-axis Top, Y-axis Right</h2>
        <div style="width: 100%; height: 500px;">
          <ngx-responsive-container [width]="'100%'" [height]="'100%'">
            <ngx-line-chart [data]="chartData">
              <svg:g
                ngx-cartesian-grid
                [horizontal]="true"
                [vertical]="false"
              ></svg:g>
              <svg:g
                ngx-x-axis
                [data]="chartData"
                [orientation]="'top'"
                dataKey="name"
                [label]="'Categories'"
                [chartType]="'line'"
              ></svg:g>
              <svg:g
                ngx-y-axis
                [data]="chartData"
                [orientation]="'right'"
                [label]="'Values (Auto)'"
              ></svg:g>
              <svg:g
                ngx-line
                [data]="chartData"
                dataKey="uv"
                stroke="#8884d8"
              ></svg:g>
              <svg:g
                ngx-line
                [data]="chartData"
                [activeDot]="{
                  r: 16,
                }"
                dataKey="pv"
                stroke="#82ca9d"
              ></svg:g>

            </ngx-line-chart>

            <!-- Tooltip outside SVG context -->
            <ngx-tooltip
              [separator]="' | '"
              [offset]="10"
              [snapToDataPoint]="true"
              [isAnimationActive]="true"
              [animationDuration]="150">
            </ngx-tooltip>

            <!-- Legend positioned as overlay -->
            <ngx-legend
              [payload]="lineChartLegend"
              [layout]="'horizontal'"
              [align]="'center'"
              [verticalAlign]="'bottom'"
              (legendClick)="onLegendClick($event)"
              (legendMouseEnter)="onLegendHover($event)"
            >
            </ngx-legend>
          </ngx-responsive-container>
        </div>
      </div>

      <div class="chart-container">
        <h2>Bar Chart - Default Orientation (Bottom/Left)</h2>
        <div style="width: 100%; height: 500px;">
          <ngx-responsive-container [width]="'100%'" [height]="'100%'">
            <ngx-bar-chart [data]="chartData">
              <svg:g
                ngx-cartesian-grid
                strokeDasharray="5 5"
                stroke="#e0e0e0"
              ></svg:g>
              <svg:g
                ngx-x-axis
                dataKey="name"
                [data]="chartData"
                [orientation]="'bottom'"
                [label]="'Categories'"
                [chartType]="'bar'"
              ></svg:g>
              <svg:g
                ngx-y-axis
                [data]="chartData"
                [orientation]="'left'"
                [label]="'Values (Auto)'"
              ></svg:g>
              <svg:g
                ngx-bar
                [data]="chartData"
                dataKey="uv"
                fill="#8884d8"
                [barIndex]="0"
                [barCount]="2"
                [animationBegin]="0"
                [animationEasing]="'linear'"
              ></svg:g>
              <svg:g
                ngx-bar
                [data]="chartData"
                dataKey="pv"
                fill="#82ca9d"
                [barIndex]="1"
                [barCount]="2"
              ></svg:g>

            </ngx-bar-chart>

            <!-- Tooltip outside SVG context -->
            <ngx-tooltip
              [separator]="' - '"
              [offset]="15"
              [snapToDataPoint]="false">
            </ngx-tooltip>

            <!-- Legend positioned as overlay -->
            <ngx-legend
              [payload]="barChartLegend"
              [layout]="'horizontal'"
              [align]="'center'"
              [verticalAlign]="'bottom'"
              (legendClick)="onLegendClick($event)"
            >
            </ngx-legend>
          </ngx-responsive-container>
        </div>
      </div>

      <div class="chart-container">
        <h2>Area Chart with ResponsiveContainer & Legend</h2>
        <div style="width: 100%; height: 450px;">
          <ngx-responsive-container [width]="'100%'" [height]="'100%'">
            <ngx-area-chart
              [data]="chartData"
              [margin]="{ top: 10, right: 30, left: 0, bottom: 0 }"
            >
              <!-- SVG Definitions for Gradients -->
              <svg:defs>
                <svg:linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <svg:stop
                    offset="5%"
                    stop-color="#8884d8"
                    stop-opacity="0.8"
                  ></svg:stop>
                  <svg:stop
                    offset="95%"
                    stop-color="#8884d8"
                    stop-opacity="0"
                  ></svg:stop>
                </svg:linearGradient>
                <svg:linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <svg:stop
                    offset="5%"
                    stop-color="#82ca9d"
                    stop-opacity="0.8"
                  ></svg:stop>
                  <svg:stop
                    offset="95%"
                    stop-color="#82ca9d"
                    stop-opacity="0"
                  ></svg:stop>
                </svg:linearGradient>
              </svg:defs>

              <svg:g
                ngx-cartesian-grid
                strokeDasharray="2 2"
                stroke="#ddd"
              ></svg:g>
              <svg:g
                ngx-x-axis
                [data]="chartData"
                [orientation]="'bottom'"
                dataKey="name"
                [label]="'Categories'"
                [chartType]="'area'"
              ></svg:g>
              <svg:g
                ngx-y-axis
                [data]="chartData"
                [orientation]="'left'"
                [label]="'Values (Auto)'"
              ></svg:g>

              <!-- Multiple Area components -->
              <svg:g
                ngx-area
                [data]="chartData"
                dataKey="uv"
                type="monotone"
                stroke="#8884d8"
                fill="url(#colorUv)"
                [fillOpacity]="1"
              ></svg:g>
              <svg:g
                ngx-area
                [data]="chartData"
                dataKey="pv"
                type="monotone"
                stroke="#82ca9d"
                fill="url(#colorPv)"
                [fillOpacity]="1"
              ></svg:g>

              <!-- Tooltip as child component -->
              <ngx-tooltip
                [offset]="10"
                [isAnimationActive]="true"
                [animationDuration]="400"
                [snapToDataPoint]="true">
              </ngx-tooltip>
            </ngx-area-chart>

            <!-- Legend positioned outside chart -->
            <ngx-legend
              [payload]="areaChartLegend"
              [layout]="'horizontal'"
              [align]="'center'"
              [verticalAlign]="'bottom'"
              (legendClick)="onLegendClick($event)"
            >
            </ngx-legend>
          </ngx-responsive-container>
        </div>
      </div>

      <div class="chart-container">
        <h2>Text Component Demo</h2>
        <svg width="400" height="200">
          <svg:text
            ngx-text
            [x]="50"
            [y]="50"
            [children]="'Simple Text'"
            fill="#333"
          ></svg:text>
          <svg:text
            ngx-text
            [x]="50"
            [y]="80"
            [children]="'Rotated Text'"
            [angle]="45"
            fill="#8884d8"
          ></svg:text>
          <svg:text
            ngx-text
            [x]="50"
            [y]="120"
            [children]="'Multi-line text with width constraint'"
            [width]="150"
            [maxLines]="2"
            fill="#82ca9d"
          ></svg:text>
        </svg>
      </div>

      <div class="chart-container">
        <h2>Label Component Demo</h2>
        <svg width="400" height="200">
          <ngx-label
            [viewBox]="{ x: 50, y: 50, width: 100, height: 50 }"
            [value]="'Center Label'"
            [position]="'center'"
            [fill]="'#333'"
          ></ngx-label>
          <ngx-label
            [viewBox]="{ x: 200, y: 50, width: 100, height: 50 }"
            [value]="'Top Label'"
            [position]="'top'"
            [fill]="'#8884d8'"
          ></ngx-label>
          <ngx-label
            [viewBox]="{ x: 50, y: 120, width: 100, height: 50 }"
            [value]="'Inside Right'"
            [position]="'insideRight'"
            [fill]="'#82ca9d'"
          ></ngx-label>
          <!-- Visual boxes to show label positions -->
          <svg:rect
            x="50"
            y="50"
            width="100"
            height="50"
            fill="none"
            stroke="#ddd"
          ></svg:rect>
          <svg:rect
            x="200"
            y="50"
            width="100"
            height="50"
            fill="none"
            stroke="#ddd"
          ></svg:rect>
          <svg:rect
            x="50"
            y="120"
            width="100"
            height="50"
            fill="none"
            stroke="#ddd"
          ></svg:rect>
        </svg>
      </div>

      <div class="chart-container">
        <h2>ResponsiveContainer Demo</h2>
        <div style="width: 100%; height: 300px; border: 1px solid #ddd;">
          <ngx-responsive-container
            [width]="'100%'"
            [height]="'100%'"
            [minWidth]="200"
            [minHeight]="150"
          >
            <svg width="100%" height="100%">
              <svg:rect
                x="10"
                y="10"
                width="50"
                height="30"
                fill="#8884d8"
              ></svg:rect>
              <svg:text
                ngx-text
                [x]="70"
                [y]="30"
                [children]="'Responsive Content'"
                fill="#333"
              ></svg:text>
            </svg>
          </ngx-responsive-container>
        </div>
      </div>

      <div class="info">
        <h3>Chart Data:</h3>
        <p>Data points: {{ chartData.length }}</p>
        <p>Data key: uv</p>
        <p>Sample values: {{ getSampleValues() }}...</p>

        <h3>New Components Added & Tested:</h3>
        <ul>
          <li>✅ Legend - Applied to all charts with proper positioning</li>
          <li>
            ✅ ResponsiveContainer - Wrapping all charts for responsive behavior
          </li>
          <li>
            ✅ Cell - Data-only component for customizing individual elements
          </li>
          <li>
            ✅ Text - Multi-line text with scaling and rotation (demo above)
          </li>
          <li>
            ✅ Label - Positioned labels with various alignment options (demo
            above)
          </li>
          <li>✅ LabelList - Multiple labels for data points</li>
          <li>✅ Customized - Dynamic component/template rendering</li>
        </ul>

        <h3>Integration Features:</h3>
        <ul>
          <li>🔄 ResponsiveContainer automatically resizes charts</li>
          <li>📊 Legend shows data series with appropriate colors and icons</li>
          <li>
            🎨 Different legend types: line, rect for different chart types
          </li>
          <li>📱 All charts are now fully responsive</li>
        </ul>
      </div>
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

  // Legend data for different charts
  lineChartLegend: LegendPayload[] = [
    {
      value: 'UV Data',
      type: 'line',
      color: '#8884d8',
      dataKey: 'uv',
    },
    {
      value: 'PV Data',
      type: 'line',
      color: '#82ca9d',
      dataKey: 'pv',
    },
  ];

  barChartLegend: LegendPayload[] = [
    {
      value: 'UV Data',
      type: 'rect',
      color: '#8884d8',
      dataKey: 'uv',
    },
    {
      value: 'PV Data',
      type: 'rect',
      color: '#82ca9d',
      dataKey: 'pv',
    },
  ];

  areaChartLegend: LegendPayload[] = [
    {
      value: 'UV Area',
      type: 'rect',
      color: '#8884d8',
      dataKey: 'uv',
    },
    {
      value: 'PV Area',
      type: 'rect',
      color: '#82ca9d',
      dataKey: 'pv',
    },
  ];

  getSampleValues(): string {
    return this.chartData
      .slice(0, 3)
      .map((d) => getDataValue(d, 'uv'))
      .join(', ');
  }

  // Legend event handlers - Angular style
  onLegendClick(event: { data: any; index: number; event: MouseEvent }) {
    console.log('Legend clicked:', event.data.value, event.index);
  }

  onLegendHover(event: { data: any; index: number; event: MouseEvent }) {
    console.log('Legend hovered:', event.data.value);
  }

  // Tooltip formatters - recharts API (can be used in ngx-tooltip)
  tooltipFormatter = (
    value: any,
    name: string,
    props: any
  ): [string, string] => {
    return [`${value.toLocaleString()} units`, `${name} (Custom)`];
  };

  labelFormatter = (label: string, payload: any[]): string => {
    return `Category: ${label}`;
  };
}
