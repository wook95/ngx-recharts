import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { AreaChartComponent } from './area-chart.component';
import { AreaComponent } from '../cartesian/area.component';
import { XAxisComponent } from '../cartesian/x-axis.component';
import { YAxisComponent } from '../cartesian/y-axis.component';
import { CartesianGridComponent } from '../cartesian/cartesian-grid.component';
import { LegendComponent } from '../component/legend.component';
import { ResponsiveContainerComponent } from '../component/responsive-container.component';
import { TooltipService } from '../services/tooltip.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const pageData = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

const meta: Meta<AreaChartComponent> = {
  title: 'Charts/AreaChart',
  component: AreaChartComponent,
  decorators: [
    moduleMetadata({
      imports: [
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
type Story = StoryObj<AreaChartComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-area-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'area'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv"></svg:g>
        <svg:g ngx-area [data]="data" dataKey="uv" type="monotone" stroke="#8884d8" fill="#8884d8" [fillOpacity]="0.6"></svg:g>
      </ngx-area-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const StackedAreas: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-area-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'area'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv"></svg:g>
        <svg:g ngx-area [data]="data" dataKey="uv" type="monotone" stroke="#8884d8" fill="#8884d8" [fillOpacity]="0.6"></svg:g>
        <svg:g ngx-area [data]="data" dataKey="pv" type="monotone" stroke="#82ca9d" fill="#82ca9d" [fillOpacity]="0.6"></svg:g>
        <svg:g ngx-area [data]="data" dataKey="amt" type="monotone" stroke="#ffc658" fill="#ffc658" [fillOpacity]="0.6"></svg:g>
      </ngx-area-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const WithGradient: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-area-chart
        [data]="data"
        [width]="width"
        [height]="height"
        [margin]="{ top: 10, right: 30, left: 0, bottom: 0 }">
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
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'area'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv"></svg:g>
        <svg:g ngx-area [data]="data" dataKey="uv" type="monotone" stroke="#8884d8" fill="url(#colorUv)" [fillOpacity]="1"></svg:g>
        <svg:g ngx-area [data]="data" dataKey="pv" type="monotone" stroke="#82ca9d" fill="url(#colorPv)" [fillOpacity]="1"></svg:g>
      </ngx-area-chart>
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
      <ngx-area-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis dataKey="name"></svg:g>
        <svg:g ngx-y-axis></svg:g>
        <svg:g ngx-area dataKey="uv" type="monotone" stroke="#8884d8" fill="#8884d8" [fillOpacity]="0.6"></svg:g>
        <svg:g ngx-area dataKey="pv" type="monotone" stroke="#82ca9d" fill="#82ca9d" [fillOpacity]="0.6"></svg:g>
      </ngx-area-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};
