import { expect } from '@wdio/globals';
import MenuPage from '../../pages/MenuPage.js';
import LoginPage from '../../pages/LoginPage.js';
import CatalogPage from '../../pages/CatalogPage.js';
import ProductPage from '../../pages/ProductPage.js';
import CartPage from '../../pages/CartPage.js';
import CheckoutPage from '../../pages/CheckoutPage.js';
import Header from '../../pages/Header.js';
import { restartApp } from '../../helpers/app.js';
import { ensureLoggedIn, forceLogout } from '../../helpers/session.js';
import { products } from '../../data/products.js';

describe('Logout and session recovery', () => {
  beforeEach(async () => {
    await restartApp();
    await ensureLoggedIn();
  });

  it('SES-01 logs out through the menu and shows the login screen', async () => {
    await MenuPage.logout({ confirm: true });

    await LoginPage.waitForDisplayed();
    expect(await MenuPage.isLoggedIn()).toBe(false);
  });

  it('SES-02 keeps the session when logout is cancelled', async () => {
    await MenuPage.logout({ confirm: false });

    expect(await LoginPage.isDisplayed()).toBe(false);
    expect(await MenuPage.isLoggedIn()).toBe(true);
  });

  it('SES-03 ensureLoggedIn() is a no-op while the session is valid', async () => {
    expect(await ensureLoggedIn()).toBe(false);
    expect(await MenuPage.isLoggedIn()).toBe(true);
  });

  it('SES-04 ensureLoggedIn() recovers from a forced logout in the middle of a flow', async () => {
    // Mid-flow: the cart already holds an item when the session disappears.
    await CatalogPage.openProduct(products.backpack.title);
    await ProductPage.addToCart(1);

    await forceLogout(); // simulates a server-side session expiry

    expect(await ensureLoggedIn()).toBe(true);
    expect(await MenuPage.isLoggedIn()).toBe(true);

    // The flow continues without hitting the login wall again.
    await CartPage.open();
    expect(await Header.cartCount()).toBe(1);
    await CartPage.proceedToCheckout();
    expect(await CheckoutPage.isShippingDisplayed()).toBe(true);
  });
});
