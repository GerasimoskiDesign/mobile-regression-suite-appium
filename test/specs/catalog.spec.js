import { expect } from '@wdio/globals';
import CatalogPage from '../../pages/CatalogPage.js';
import { restartApp } from '../../helpers/app.js';
import { scrollToText } from '../../helpers/gestures.js';
import { lastProductByName } from '../../data/products.js';

describe('Catalog browse', () => {
  beforeEach(async () => {
    await restartApp();
  });

  it('CAT-01 shows product tiles that each have a title and a valid price', async () => {
    const titles = await CatalogPage.visibleTitles();
    // visiblePrices() throws if any label is not a "$ 0.00" price.
    const prices = await CatalogPage.visiblePrices();

    expect(titles.length).toBeGreaterThanOrEqual(2);
    expect(prices.length).toBe(titles.length);
    for (const title of titles) {
      expect(title.trim()).not.toBe('');
    }
    for (const price of prices) {
      expect(price).toBeGreaterThan(0);
    }
  });

  it('CAT-02 scrolls to the last product of the catalog', async () => {
    const tile = await scrollToText(lastProductByName);

    expect(await tile.isDisplayed()).toBe(true);
    expect(await tile.getText()).toBe(lastProductByName);
  });
});
