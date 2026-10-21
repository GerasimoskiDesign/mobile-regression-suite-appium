import { expect } from '@wdio/globals';
import CatalogPage from '../../pages/CatalogPage.js';
import { restartApp } from '../../helpers/app.js';
import { isSorted, byCodeUnits, reverse, ascending, descending } from '../../helpers/parse.js';
import { cheapestPrice, mostExpensivePrice } from '../../data/products.js';

describe('Catalog sort', () => {
  beforeEach(async () => {
    await restartApp();
  });

  it('SORT-01 sorts by name ascending', async () => {
    await CatalogPage.sortBy('nameDesc'); // move away from the default first
    await CatalogPage.sortBy('nameAsc');
    const titles = await CatalogPage.visibleTitles();

    expect(titles.length).toBeGreaterThanOrEqual(2);
    expect(isSorted(titles, byCodeUnits)).toBe(true);
  });

  it('SORT-02 sorts by name descending', async () => {
    await CatalogPage.sortBy('nameDesc');
    const titles = await CatalogPage.visibleTitles();

    expect(titles.length).toBeGreaterThanOrEqual(2);
    expect(isSorted(titles, reverse(byCodeUnits))).toBe(true);
    expect(titles[0].startsWith('Test.allTheThings()')).toBe(true);
  });

  it('SORT-03 sorts by price ascending, cheapest first', async () => {
    await CatalogPage.sortBy('priceAsc');
    const prices = await CatalogPage.visiblePrices();

    expect(prices[0]).toBe(cheapestPrice);
    expect(isSorted(prices, ascending)).toBe(true);
  });

  it('SORT-04 sorts by price descending, most expensive first', async () => {
    await CatalogPage.sortBy('priceDesc');
    const prices = await CatalogPage.visiblePrices();

    expect(prices[0]).toBe(mostExpensivePrice);
    expect(isSorted(prices, descending)).toBe(true);
  });
});
