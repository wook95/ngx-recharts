import type { Preview } from '@storybook/angular';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    viewport: {
      viewports: {
        chart: {
          name: 'Chart Default',
          styles: {
            width: '800px',
            height: '500px',
          },
        },
        chartWide: {
          name: 'Chart Wide',
          styles: {
            width: '1200px',
            height: '600px',
          },
        },
      },
      defaultViewport: 'chart',
    },
  },
};

export default preview;
