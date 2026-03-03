import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BarChartComponent } from './bar-chart.component';
import { BarComponent } from '../cartesian/bar.component';
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

const meta: Meta<BarChartComponent> = {
  title: 'Charts/BarChart',
  component: BarChartComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BarComponent,
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
type Story = StoryObj<BarChartComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-bar-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'bar'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="uv" fill="#8884d8"></svg:g>
      </ngx-bar-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const MultipleBars: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-bar-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'bar'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="uv" fill="#8884d8"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="pv" fill="#82ca9d"></svg:g>
      </ngx-bar-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const WithCustomColors: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-bar-chart
        [data]="data"
        [width]="width"
        [height]="height"
        [margin]="{ top: 20, right: 30, bottom: 20, left: 30 }">
        <svg:g ngx-cartesian-grid strokeDasharray="5 5" stroke="#e0e0e0"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'bar'" [label]="'Categories'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv" [label]="'Values'"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="uv" fill="#ff7300"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="pv" fill="#413ea0"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="amt" fill="#82ca9d"></svg:g>
      </ngx-bar-chart>
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
      <ngx-bar-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid strokeDasharray="5 5"></svg:g>
        <svg:g ngx-x-axis dataKey="name"></svg:g>
        <svg:g ngx-y-axis></svg:g>
        <svg:g ngx-bar dataKey="uv" fill="#8884d8"></svg:g>
        <svg:g ngx-bar dataKey="pv" fill="#82ca9d"></svg:g>
      </ngx-bar-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const Interactive: Story = {
  render: (args) => ({
    props: {
      ...args,
      onChartClick: (event: any) => console.log('Chart clicked:', event),
      onChartMouseMove: (event: any) => console.log('Mouse move:', event),
    },
    template: `
      <ngx-bar-chart
        [data]="data"
        [width]="width"
        [height]="height"
        (chartClick)="onChartClick($event)"
        (chartMouseMove)="onChartMouseMove($event)"
      >
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'bar'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv"></svg:g>
        <svg:g ngx-bar [data]="data" dataKey="uv" fill="#8884d8"></svg:g>
      </ngx-bar-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};
