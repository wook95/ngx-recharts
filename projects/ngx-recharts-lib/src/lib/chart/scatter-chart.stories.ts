import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ScatterChartComponent } from './scatter-chart.component';
import { ScatterComponent } from '../cartesian/scatter.component';
import { XAxisComponent } from '../cartesian/x-axis.component';
import { YAxisComponent } from '../cartesian/y-axis.component';
import { CartesianGridComponent } from '../cartesian/cartesian-grid.component';
import { TooltipService } from '../services/tooltip.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const scatterData01 = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 },
];

const scatterData02 = [
  { x: 200, y: 260, z: 240 },
  { x: 240, y: 290, z: 220 },
  { x: 190, y: 290, z: 250 },
  { x: 198, y: 250, z: 210 },
  { x: 180, y: 280, z: 260 },
  { x: 210, y: 220, z: 230 },
];

const meta: Meta<ScatterChartComponent> = {
  title: 'Charts/ScatterChart',
  component: ScatterChartComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ScatterComponent,
        XAxisComponent,
        YAxisComponent,
        CartesianGridComponent,
      ],
      providers: [TooltipService, ResponsiveContainerService],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    width: { control: { type: 'number', min: 200, max: 1200 } },
    height: { control: { type: 'number', min: 200, max: 800 } },
  },
};

export default meta;
type Story = StoryObj<ScatterChartComponent>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, scatterData01 },
    template: `
      <ngx-scatter-chart [data]="scatterData01" [width]="width" [height]="height"
        [margin]="{ top: 20, right: 20, bottom: 20, left: 20 }">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="scatterData01" dataKey="x" type="number" [chartType]="'bar'"></svg:g>
        <svg:g ngx-y-axis [data]="scatterData01" dataKey="y" type="number"></svg:g>
        <svg:g ngx-scatter [data]="scatterData01" [dataKey]="{ x: 'x', y: 'y' }"
          fill="#8884d8" name="Series A"></svg:g>
      </ngx-scatter-chart>
    `,
  }),
  args: {
    width: 600,
    height: 400,
  },
};

export const TwoSeries: Story = {
  name: 'Two Series',
  render: (args) => ({
    props: { ...args, scatterData01, scatterData02 },
    template: `
      <ngx-scatter-chart [data]="scatterData01" [width]="width" [height]="height"
        [margin]="{ top: 20, right: 20, bottom: 20, left: 20 }">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="scatterData01" dataKey="x" type="number" [chartType]="'bar'"></svg:g>
        <svg:g ngx-y-axis [data]="scatterData01" dataKey="y" type="number"></svg:g>
        <svg:g ngx-scatter [data]="scatterData01" [dataKey]="{ x: 'x', y: 'y' }"
          fill="#8884d8" name="Series A"></svg:g>
        <svg:g ngx-scatter [data]="scatterData02" [dataKey]="{ x: 'x', y: 'y' }"
          fill="#82ca9d" name="Series B"></svg:g>
      </ngx-scatter-chart>
    `,
  }),
  args: {
    width: 600,
    height: 400,
  },
};

export const Interactive: Story = {
  render: (args) => ({
    props: {
      ...args,
      scatterData01,
      onChartClick: (event: any) => console.log('Chart clicked:', event),
      onChartMouseMove: (event: any) => console.log('Mouse move:', event),
    },
    template: `
      <ngx-scatter-chart
        [data]="scatterData01"
        [width]="width"
        [height]="height"
        [margin]="{ top: 20, right: 20, bottom: 20, left: 20 }"
        (chartClick)="onChartClick($event)"
        (chartMouseMove)="onChartMouseMove($event)"
      >
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="scatterData01" dataKey="x" type="number" [chartType]="'bar'"></svg:g>
        <svg:g ngx-y-axis [data]="scatterData01" dataKey="y" type="number"></svg:g>
        <svg:g ngx-scatter [data]="scatterData01" [dataKey]="{ x: 'x', y: 'y' }"
          fill="#8884d8" name="Series A"></svg:g>
      </ngx-scatter-chart>
    `,
  }),
  args: {
    width: 600,
    height: 400,
  },
};
