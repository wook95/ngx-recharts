import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { RadialBarChartComponent } from './radial-bar-chart.component';
import { RadialBarComponent } from '../polar/radial-bar.component';
import { TooltipService } from '../services/tooltip.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const radialData = [
  { name: '18-24', uv: 31.47, pv: 2400, fill: '#8884d8' },
  { name: '25-29', uv: 26.69, pv: 4567, fill: '#83a6ed' },
  { name: '30-34', uv: 15.69, pv: 1398, fill: '#8dd1e1' },
  { name: '35-39', uv: 8.22, pv: 9800, fill: '#82ca9d' },
  { name: '40-49', uv: 8.63, pv: 3908, fill: '#a4de6c' },
  { name: '50+', uv: 2.63, pv: 4800, fill: '#d0ed57' },
  { name: 'unknown', uv: 6.67, pv: 4800, fill: '#ffc658' },
];

const meta: Meta<RadialBarChartComponent> = {
  title: 'Charts/RadialBarChart',
  component: RadialBarChartComponent,
  decorators: [
    moduleMetadata({
      imports: [RadialBarComponent],
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
type Story = StoryObj<RadialBarChartComponent>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, radialData },
    template: `
      <ngx-radial-bar-chart [data]="radialData" [width]="width" [height]="height"
        cx="50%" cy="50%" [innerRadius]="'10%'" [outerRadius]="'80%'"
        [startAngle]="180" [endAngle]="0">
        <svg:g ngx-radial-bar dataKey="uv" [background]="true" [label]="true"></svg:g>
      </ngx-radial-bar-chart>
    `,
  }),
  args: {
    width: 500,
    height: 300,
  },
};

export const FullCircle: Story = {
  render: (args) => ({
    props: { ...args, radialData },
    template: `
      <ngx-radial-bar-chart [data]="radialData" [width]="width" [height]="height"
        cx="50%" cy="50%" [innerRadius]="'20%'" [outerRadius]="'90%'"
        [barSize]="10">
        <svg:g ngx-radial-bar dataKey="uv" [background]="true"></svg:g>
      </ngx-radial-bar-chart>
    `,
  }),
  args: {
    width: 500,
    height: 500,
  },
};

export const WithCornerRadius: Story = {
  render: (args) => ({
    props: { ...args, radialData },
    template: `
      <ngx-radial-bar-chart [data]="radialData" [width]="width" [height]="height"
        cx="50%" cy="50%" [innerRadius]="'10%'" [outerRadius]="'80%'"
        [startAngle]="180" [endAngle]="0">
        <svg:g ngx-radial-bar dataKey="uv" [cornerRadius]="10" [background]="true"></svg:g>
      </ngx-radial-bar-chart>
    `,
  }),
  args: {
    width: 500,
    height: 300,
  },
};

export const Interactive: Story = {
  render: (args) => ({
    props: {
      ...args,
      radialData,
      onChartClick: (event: any) => console.log('Chart clicked:', event),
      onChartMouseMove: (event: any) => console.log('Mouse move:', event),
    },
    template: `
      <ngx-radial-bar-chart
        [data]="radialData"
        [width]="width"
        [height]="height"
        cx="50%" cy="50%" [innerRadius]="'10%'" [outerRadius]="'80%'"
        [startAngle]="180" [endAngle]="0"
        (chartClick)="onChartClick($event)"
        (chartMouseMove)="onChartMouseMove($event)"
      >
        <svg:g ngx-radial-bar dataKey="uv" [background]="true" [label]="true"></svg:g>
      </ngx-radial-bar-chart>
    `,
  }),
  args: {
    width: 500,
    height: 300,
  },
};
