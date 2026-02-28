import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ComposedChartComponent } from './composed-chart.component';
import { LineComponent } from '../cartesian/line.component';
import { BarComponent } from '../cartesian/bar.component';
import { AreaComponent } from '../cartesian/area.component';
import { XAxisComponent } from '../cartesian/x-axis.component';
import { YAxisComponent } from '../cartesian/y-axis.component';
import { CartesianGridComponent } from '../cartesian/cartesian-grid.component';
import { LegendComponent } from '../component/legend.component';
import { ResponsiveContainerComponent } from '../component/responsive-container.component';
import { TooltipService } from '../services/tooltip.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';

const pageData = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

const meta: Meta<ComposedChartComponent> = {
  title: 'Charts/ComposedChart',
  component: ComposedChartComponent,
  decorators: [
    moduleMetadata({
      imports: [
        LineComponent,
        BarComponent,
        AreaComponent,
        XAxisComponent,
        YAxisComponent,
        CartesianGridComponent,
        LegendComponent,
        ResponsiveContainerComponent,
      ],
      providers: [
        TooltipService,
        ResponsiveContainerService,
        GraphicalItemRegistryService,
      ],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    data: { control: 'object' },
    width: { control: { type: 'number', min: 200, max: 1200 } },
    height: { control: { type: 'number', min: 200, max: 800 } },
  },
};

export default meta;
type Story = StoryObj<ComposedChartComponent>;

export const LineBarArea: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-composed-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'composed'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv"></svg:g>
        <svg:g ngx-area [data]="data" dataKey="amt" type="monotone" fill="#8884d8" stroke="#8884d8" [fillOpacity]="0.6"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="pv" fill="#82ca9d"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="uv" stroke="#ff7300"></svg:g>
      </ngx-composed-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 700,
    height: 450,
  },
};

export const BarWithLine: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-composed-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid strokeDasharray="5 5" stroke="#e0e0e0"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'composed'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="pv"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="pv" fill="#413ea0"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="uv" stroke="#ff7300" [strokeWidth]="2"></svg:g>
      </ngx-composed-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const AreaWithLine: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-composed-chart 
        [data]="data" 
        [width]="width" 
        [height]="height"
        [margin]="{ top: 20, right: 30, bottom: 20, left: 30 }">
        <svg:defs>
          <svg:linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
            <svg:stop offset="5%" stop-color="#8884d8" stop-opacity="0.8"></svg:stop>
            <svg:stop offset="95%" stop-color="#8884d8" stop-opacity="0.1"></svg:stop>
          </svg:linearGradient>
        </svg:defs>
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'composed'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv"></svg:g>
        <svg:g ngx-area [data]="data" dataKey="amt" type="monotone" fill="url(#colorAmt)" stroke="#8884d8" [fillOpacity]="1"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="uv" stroke="#ff7300" [strokeWidth]="2"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="pv" stroke="#82ca9d" [strokeWidth]="2"></svg:g>
      </ngx-composed-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 700,
    height: 450,
  },
};

export const MultipleBarsWithLine: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-composed-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'composed'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="pv"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="uv" fill="#8884d8"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="pv" fill="#82ca9d"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="amt" stroke="#ff7300" [strokeWidth]="2"></svg:g>
      </ngx-composed-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 700,
    height: 450,
  },
};

export const CleanAPI: Story = {
  name: 'Clean API (No [data] on children)',
  render: (args) => ({
    props: args,
    template: `
      <ngx-composed-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis dataKey="name"></svg:g>
        <svg:g ngx-y-axis></svg:g>
        <svg:g ngx-area dataKey="amt" type="monotone" fill="#8884d8" stroke="#8884d8" [fillOpacity]="0.6"></svg:g>
        <svg:g ngx-bar dataKey="pv" fill="#82ca9d"></svg:g>
        <svg:g ngx-line dataKey="uv" stroke="#ff7300"></svg:g>
      </ngx-composed-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 700,
    height: 450,
  },
};
