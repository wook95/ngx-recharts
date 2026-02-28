import { test, expect } from '@playwright/test';

test('debug BarWithLine positions', async ({ page }) => {
  await page.goto('/iframe.html?id=charts-composedchart--bar-with-line&viewMode=story');
  await page.waitForSelector('.recharts-bar-rectangle');
  await page.waitForTimeout(500);

  // Get bar positions
  const bars = page.locator('.recharts-bar-rectangle');
  const barCount = await bars.count();
  console.log(`Bar count: ${barCount}`);

  for (let i = 0; i < Math.min(3, barCount); i++) {
    const x = await bars.nth(i).getAttribute('x');
    const w = await bars.nth(i).getAttribute('width');
    console.log(`Bar[${i}]: x=${x}, width=${w}, center=${Number(x) + Number(w) / 2}`);
  }

  // Get line dot positions
  const dots = page.locator('.recharts-line-dot');
  const dotCount = await dots.count();
  console.log(`Dot count: ${dotCount}`);

  for (let i = 0; i < Math.min(3, dotCount); i++) {
    const cx = await dots.nth(i).getAttribute('cx');
    const cy = await dots.nth(i).getAttribute('cy');
    console.log(`Dot[${i}]: cx=${cx}, cy=${cy}`);
  }

  // Get SVG group transform
  const gTransform = await page.locator('svg g[transform]').first().getAttribute('transform');
  console.log(`SVG transform: ${gTransform}`);

  // Check the SVG structure
  const svgWidth = await page.locator('svg').first().getAttribute('width');
  const svgHeight = await page.locator('svg').first().getAttribute('height');
  console.log(`SVG dimensions: ${svgWidth}x${svgHeight}`);

  expect(barCount).toBeGreaterThan(0);
});
