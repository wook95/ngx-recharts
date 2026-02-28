import { test } from '@playwright/test';
const stories = [
  'charts-composedchart--bar-with-line',
  'charts-composedchart--line-bar-area',
  'charts-composedchart--area-with-line',
  'charts-composedchart--multiple-bars-with-line',
  'charts-linechart--default',
  'charts-barchart--default',
  'charts-areachart--default',
];
for (const id of stories) {
  test(`screenshot ${id}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${id}&viewMode=story`);
    await page.waitForSelector('svg');
    await page.waitForTimeout(500);
    const name = id.replace('charts-', '');
    await page.screenshot({ path: `e2e/screenshots/${name}.png` });
  });
}
