import { expect } from '@wdio/globals';
import CatalogPage from '../../pages/CatalogPage.js';
import ProductPage from '../../pages/ProductPage.js';
import Header from '../../pages/Header.js';
import { restartApp } from '../../helpers/app.js';
import { products } from '../../data/products.js';

describe('Product detail', () => {
  beforeEach(async () => {
    await restartApp();
  });

  it('PDP-01 shows the same title and price as the catalog tile', async () => {
    const tile = await CatalogPage.openFirstProduct();

    expect(await ProductPage.title()).toBe(tile.title);
    expect(await ProductPage.price()).toBe(tile.price);
  });

  it('PDP-02 changes quantity with the plus and minus buttons', async () => {
    await CatalogPage.openProduct(products.backpackOrange.title);
    expect(await ProductPage.title()).toBe(products.backpackOrange.title);
    expect(await ProductPage.quantity()).toBe(1);

    await ProductPage.increase(2);
    expect(await ProductPage.quantity()).toBe(3);

    await ProductPage.decrease(1);
    expect(await ProductPage.quantity()).toBe(2);
  });

  it('PDP-03 adds nothing to the cart when quantity is lowered to zero', async () => {
    // The picker allows 0. This pins the current behaviour: "Add to cart" is a no-op,
    // the badge stays hidden. If the app starts disabling the button instead, update here.
    await CatalogPage.openProduct(products.backpack.title);
    await ProductPage.decrease(1);
    expect(await ProductPage.quantity()).toBe(0);

    await ProductPage.addToCart(0);
    expect(await Header.cartCount()).toBe(0);
  });

  // Quarantined: fails on app releases 2.2.0 and 2.3.0 (crash). Excluded from the default
  // run by the @known-defect tag; run it with `npm run test:known-defects`.
  it('PDP-04 opens the product in grid position 2 without crashing @known-defect', async () => {
    await CatalogPage.openProduct(products.backpackGreen.title);

    expect(await ProductPage.title()).toBe(products.backpackGreen.title);
  });
});
