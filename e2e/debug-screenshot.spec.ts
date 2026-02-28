import { test, expect } from '@playwright/test';

test('screenshot BarWithLine', async ({ page }) => {
  await page.goto('/iframe.html?id=charts-composedchart--bar-with-line&viewMode=story');
  await page.waitForSelector('.recharts-bar-rectangle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'e2e/screenshots/bar-with-line.png', fullPage: true });
  
  // Dump ALL SVG element positions
  const info = await page.evaluate(() => {
    const bars = document.querySelectorAll('.recharts-bar-rectangle');
    const dots = document.querySelectorAll('.recharts-line-dot');
    const activeDots = document.querySelectorAll('.recharts-line-active-dot');
    const linePaths = document.querySelectorAll('.recharts-line-curve');
    const areaPaths = document.querySelectorAll('.recharts-area-area');
    
    return {
      bars: Array.from(bars).map((b, i) => ({
        x: b.getAttribute('x'), width: b.getAttribute('width'),
        y: b.getAttribute('y'), height: b.getAttribute('height'),
      })),
      dots: Array.from(dots).map((d, i) => ({
        cx: d.getAttribute('cx'), cy: d.getAttribute('cy'),
      })),
      linePaths: Array.from(linePaths).map(p => p.getAttribute('d')),
      svgSize: {
        width: document.querySelector('svg')?.getAttribute('width'),
        height: document.querySelector('svg')?.getAttribute('height'),
      },
      transforms: Array.from(document.querySelectorAll('svg g[transform]')).map(g => g.getAttribute('transform')),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  expect(info.bars.length).toBeGreaterThan(0);
});
