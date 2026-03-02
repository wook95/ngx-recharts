import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { PieChartComponent } from './pie-chart.component';
import { PieComponent } from '../polar/pie.component';
import { TooltipService } from '../services/tooltip.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const data01 = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
  { name: 'Group E', value: 278 },
  { name: 'Group F', value: 189 },
];

const data02 = [
  { name: 'A1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'B2', value: 80 },
  { name: 'B3', value: 40 },
  { name: 'B4', value: 30 },
  { name: 'B5', value: 50 },
  { name: 'C1', value: 100 },
  { name: 'C2', value: 200 },
  { name: 'D1', value: 150 },
  { name: 'D2', value: 50 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const meta: Meta<PieChartComponent> = {
  title: 'Charts/PieChart',
  component: PieChartComponent,
  decorators: [
    moduleMetadata({
      imports: [PieComponent],
      providers: [TooltipService, ResponsiveContainerService],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    width: { control: { type: 'number', min: 200, max: 800 } },
    height: { control: { type: 'number', min: 200, max: 800 } },
  },
};

export default meta;
type Story = StoryObj<PieChartComponent>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, data01 },
    template: `
      <ngx-pie-chart [data]="data01" [width]="width" [height]="height">
        <svg:g ngx-pie [data]="data01" dataKey="value" nameKey="name"
          [outerRadius]="80" fill="#8884d8" [label]="true">
        </svg:g>
      </ngx-pie-chart>
    `,
  }),
  args: {
    width: 400,
    height: 400,
  },
};

export const Donut: Story = {
  render: (args) => ({
    props: { ...args, data01 },
    template: `
      <ngx-pie-chart [data]="data01" [width]="width" [height]="height">
        <svg:g ngx-pie [data]="data01" dataKey="value" nameKey="name"
          [innerRadius]="60" [outerRadius]="80" fill="#8884d8"
          [paddingAngle]="5" [label]="true">
        </svg:g>
      </ngx-pie-chart>
    `,
  }),
  args: {
    width: 400,
    height: 400,
  },
};

export const TwoPies: Story = {
  name: 'Two Pies (Nested)',
  render: (args) => ({
    props: { ...args, data01, data02 },
    template: `
      <ngx-pie-chart [data]="data01" [width]="width" [height]="height">
        <svg:g ngx-pie [data]="data01" dataKey="value" nameKey="name"
          [outerRadius]="60" fill="#8884d8">
        </svg:g>
        <svg:g ngx-pie [data]="data02" dataKey="value" nameKey="name"
          [innerRadius]="70" [outerRadius]="90" fill="#82ca9d" [label]="true">
        </svg:g>
      </ngx-pie-chart>
    `,
  }),
  args: {
    width: 500,
    height: 500,
  },
};
