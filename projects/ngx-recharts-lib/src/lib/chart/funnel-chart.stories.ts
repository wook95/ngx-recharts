import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FunnelChartComponent } from './funnel-chart.component';
import { FunnelComponent } from '../cartesian/funnel.component';
import { TooltipService } from '../services/tooltip.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const funnelData = [
  { value: 100, name: 'Visits', fill: '#8884d8' },
  { value: 80, name: 'Cart', fill: '#83a6ed' },
  { value: 50, name: 'Checkout', fill: '#8dd1e1' },
  { value: 40, name: 'Purchase', fill: '#82ca9d' },
  { value: 26, name: 'Repeat', fill: '#a4de6c' },
];

const meta: Meta<FunnelChartComponent> = {
  title: 'Charts/FunnelChart',
  component: FunnelChartComponent,
  decorators: [
    moduleMetadata({
      imports: [FunnelComponent],
      providers: [TooltipService, ResponsiveContainerService],
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
type Story = StoryObj<FunnelChartComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-funnel-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-funnel [data]="data" dataKey="value" nameKey="name" fill="#8884d8"></svg:g>
      </ngx-funnel-chart>
    `,
  }),
  args: {
    data: funnelData,
    width: 600,
    height: 400,
  },
};
