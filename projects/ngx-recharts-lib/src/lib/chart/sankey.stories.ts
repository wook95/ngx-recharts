import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SankeyComponent } from './sankey.component';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const sankeyData = {
  nodes: [
    { name: 'Visit' },
    { name: 'Direct' },
    { name: 'Pages' },
    { name: 'Referral' },
    { name: 'Social' },
  ],
  links: [
    { source: 0, target: 2, value: 5000 },
    { source: 1, target: 2, value: 2500 },
    { source: 3, target: 2, value: 1500 },
    { source: 4, target: 2, value: 1000 },
  ],
};

const meta: Meta<SankeyComponent> = {
  title: 'Charts/Sankey',
  component: SankeyComponent,
  decorators: [
    moduleMetadata({
      providers: [ResponsiveContainerService],
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
type Story = StoryObj<SankeyComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-sankey [data]="data" [width]="width" [height]="height"></ngx-sankey>
    `,
  }),
  args: {
    data: sankeyData,
    width: 600,
    height: 400,
  },
};
