import { expect } from '@wdio/globals';
import MenuPage from '../../pages/MenuPage.js';
import CatalogPage from '../../pages/CatalogPage.js';
import ProductPage from '../../pages/ProductPage.js';
import Header from '../../pages/Header.js';
import { restartApp, backgroundApp } from '../../helpers/app.js';
import { ensureLoggedIn } from '../../helpers/session.js';
import { products } from '../../data/products.js';

describe('App restart persistence', () => {
  beforeEach(async () => {
    await restartApp();
    await ensureLoggedIn();
    await CatalogPage.openProduct(products.backpack.title);
    await ProductPage.addToCart(2);
    expect(await Header.cartCount()).toBe(2);
  });

  it('RST-01 keeps cart and session after the app is backgrounded and resumed', async () => {
    await backgroundApp(3);

    await ProductPage.waitForLoaded();
    expect(await Header.cartCount()).toBe(2);
    expect(await MenuPage.isLoggedIn()).toBe(true);
  });

  it('RST-02 starts clean after a cold restart, and ensureLoggedIn() restores the session', async () => {
    // The demo app keeps cart and session in memory only. This test documents that
    // contract; a production app that persists the cart would assert the opposite.
    await restartApp();

    expect(await Header.cartCount()).toBe(0);
    expect(await MenuPage.isLoggedIn()).toBe(false);

    expect(await ensureLoggedIn()).toBe(true);
    expect(await MenuPage.isLoggedIn()).toBe(true);
  });
});
