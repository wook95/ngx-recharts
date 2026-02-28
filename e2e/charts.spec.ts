import { test, expect } from '@playwright/test';

// Helper to navigate to a Storybook story
function storyUrl(id: string) {
  return `/iframe.html?id=${id}&viewMode=story`;
}

test.describe('LineChart', () => {
  test('SimpleLineChart renders SVG with line path', async ({ page }) => {
    await page.goto(storyUrl('charts-linechart--default'));
    await page.waitForSelector('.recharts-line-curve');
    const paths = page.locator('.recharts-line-curve');
    await expect(paths.first()).toBeVisible();
    const d = await paths.first().getAttribute('d');
    expect(d).toBeTruthy();
    expect(d!.startsWith('M')).toBeTruthy();
  });

  test('MultiLineChart renders multiple lines', async ({ page }) => {
    await page.goto(storyUrl('charts-linechart--multiple-lines'));
    await page.waitForSelector('.recharts-line-curve');
    const paths = page.locator('.recharts-line-curve');
    expect(await paths.count()).toBeGreaterThanOrEqual(2);
  });
});

test.describe('BarChart', () => {
  test('SimpleBarChart renders bars', async ({ page }) => {
    await page.goto(storyUrl('charts-barchart--default'));
    await page.waitForSelector('.recharts-bar-rectangle');
    const bars = page.locator('.recharts-bar-rectangle');
    expect(await bars.count()).toBeGreaterThan(0);
  });

  test('bars have positive dimensions', async ({ page }) => {
    await page.goto(storyUrl('charts-barchart--default'));
    await page.waitForSelector('.recharts-bar-rectangle');
    const bar = page.locator('.recharts-bar-rectangle').first();
    const width = await bar.getAttribute('width');
    const height = await bar.getAttribute('height');
    expect(Number(width)).toBeGreaterThan(0);
    expect(Number(height)).toBeGreaterThan(0);
  });
});

test.describe('AreaChart', () => {
  test('SimpleAreaChart renders area path', async ({ page }) => {
    await page.goto(storyUrl('charts-areachart--default'));
    await page.waitForSelector('.recharts-area-area');
    const areas = page.locator('.recharts-area-area');
    await expect(areas.first()).toBeVisible();
    const d = await areas.first().getAttribute('d');
    expect(d).toBeTruthy();
  });
});

test.describe('ComposedChart', () => {
  test('LineBarArea renders all three element types', async ({ page }) => {
    await page.goto(storyUrl('charts-composedchart--line-bar-area'));
    await page.waitForSelector('.recharts-bar-rectangle');

    // Should have bars
    const bars = page.locator('.recharts-bar-rectangle');
    expect(await bars.count()).toBeGreaterThan(0);

    // Should have line
    const lines = page.locator('.recharts-line-curve');
    expect(await lines.count()).toBeGreaterThanOrEqual(1);

    // Should have area
    const areas = page.locator('.recharts-area-area');
    expect(await areas.count()).toBeGreaterThanOrEqual(1);
  });

  test('BarWithLine - line dots align with bar centers', async ({ page }) => {
    await page.goto(storyUrl('charts-composedchart--bar-with-line'));
    await page.waitForSelector('.recharts-bar-rectangle');

    const bars = page.locator('.recharts-bar-rectangle');
    const dots = page.locator('.recharts-line-dot');

    const barCount = await bars.count();
    const dotCount = await dots.count();
    expect(barCount).toBeGreaterThan(0);
    expect(dotCount).toBe(barCount);

    // Each dot's cx should be within the bar's x range (bar center alignment)
    for (let i = 0; i < Math.min(barCount, dotCount); i++) {
      const barX = Number(await bars.nth(i).getAttribute('x'));
      const barWidth = Number(await bars.nth(i).getAttribute('width'));
      const barCenter = barX + barWidth / 2;

      const dotCx = Number(await dots.nth(i).getAttribute('cx'));

      // Dot should be near the bar center (within 2px tolerance)
      expect(Math.abs(dotCx - barCenter)).toBeLessThan(2);
    }
  });

  test('AreaWithLine uses linear scale (no bars)', async ({ page }) => {
    await page.goto(storyUrl('charts-composedchart--area-with-line'));
    await page.waitForSelector('.recharts-area-area');

    // Should NOT have bars
    const bars = page.locator('.recharts-bar-rectangle');
    expect(await bars.count()).toBe(0);

    // Should have area and lines
    const areas = page.locator('.recharts-area-area');
    expect(await areas.count()).toBeGreaterThanOrEqual(1);

    const lines = page.locator('.recharts-line-curve');
    expect(await lines.count()).toBeGreaterThanOrEqual(2);

    // Line dots should be evenly spaced (linear scale)
    const dots = page.locator('.recharts-line-dot');
    const dotCount = await dots.count();
    if (dotCount >= 3) {
      // Get first line's dots (first 7 dots for 7 data points)
      const x0 = Number(await dots.nth(0).getAttribute('cx'));
      const x1 = Number(await dots.nth(1).getAttribute('cx'));
      const x2 = Number(await dots.nth(2).getAttribute('cx'));
      const spacing1 = x1 - x0;
      const spacing2 = x2 - x1;
      // Linear scale: spacings should be equal (within 1px)
      expect(Math.abs(spacing1 - spacing2)).toBeLessThan(1);
    }
  });

  test('MultipleBarsWithLine - bars are grouped side by side', async ({ page }) => {
    await page.goto(storyUrl('charts-composedchart--multiple-bars-with-line'));
    await page.waitForSelector('.recharts-bar-rectangle');

    const bars = page.locator('.recharts-bar-rectangle');
    const barCount = await bars.count();
    // 7 data points * 2 bar series = 14 bars
    expect(barCount).toBe(14);

    // Check that bars in the first data point are side by side (not overlapping)
    const bar0X = Number(await bars.nth(0).getAttribute('x'));
    const bar0Width = Number(await bars.nth(0).getAttribute('width'));
    const bar7X = Number(await bars.nth(7).getAttribute('x'));
    const bar7Width = Number(await bars.nth(7).getAttribute('width'));

    // Second series bar should start where first series bar ends
    expect(Math.abs(bar7X - (bar0X + bar0Width))).toBeLessThan(2);

    // Both bars should have similar width
    expect(Math.abs(bar0Width - bar7Width)).toBeLessThan(1);
  });

  test('no console errors in composed charts', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(storyUrl('charts-composedchart--line-bar-area'));
    await page.waitForSelector('.recharts-bar-rectangle');
    await page.waitForTimeout(1000);

    // Filter out common non-app errors
    const appErrors = errors.filter(e => !e.includes('favicon') && !e.includes('net::'));
    expect(appErrors).toHaveLength(0);
  });
});

test.describe('Regression - Standalone charts unaffected', () => {
  test('LineChart still uses linear scale', async ({ page }) => {
    await page.goto(storyUrl('charts-linechart--default'));
    await page.waitForSelector('.recharts-line-dot');

    const dots = page.locator('.recharts-line-dot');
    const count = await dots.count();
    if (count >= 3) {
      const x0 = Number(await dots.nth(0).getAttribute('cx'));
      const x1 = Number(await dots.nth(1).getAttribute('cx'));
      const x2 = Number(await dots.nth(2).getAttribute('cx'));
      const spacing1 = x1 - x0;
      const spacing2 = x2 - x1;
      expect(Math.abs(spacing1 - spacing2)).toBeLessThan(1);
    }
  });

  test('BarChart bars still have full bandwidth', async ({ page }) => {
    await page.goto(storyUrl('charts-barchart--default'));
    await page.waitForSelector('.recharts-bar-rectangle');

    const bars = page.locator('.recharts-bar-rectangle');
    const count = await bars.count();
    if (count >= 2) {
      const bar0Width = Number(await bars.nth(0).getAttribute('width'));
      const bar1Width = Number(await bars.nth(1).getAttribute('width'));
      // All bars should have same width in single-bar chart
      expect(Math.abs(bar0Width - bar1Width)).toBeLessThan(1);
      // Width should be reasonable (not tiny from accidental grouping)
      expect(bar0Width).toBeGreaterThan(20);
    }
  });
});
