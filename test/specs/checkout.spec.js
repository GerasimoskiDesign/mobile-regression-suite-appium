import { expect } from '@wdio/globals';
import CatalogPage from '../../pages/CatalogPage.js';
import ProductPage from '../../pages/ProductPage.js';
import CartPage from '../../pages/CartPage.js';
import CheckoutPage from '../../pages/CheckoutPage.js';
import LoginPage from '../../pages/LoginPage.js';
import { restartApp } from '../../helpers/app.js';
import { ensureLoggedIn } from '../../helpers/session.js';
import { products } from '../../data/products.js';
import { users, shippingAddress, testCard } from '../../data/users.js';

const { backpack } = products;

/** Cart with one backpack, logged in, on the shipping form. */
async function reachShippingForm() {
  await ensureLoggedIn();
  await CatalogPage.openProduct(backpack.title);
  await ProductPage.addToCart(1);
  await CartPage.open();
  await CartPage.proceedToCheckout();
  expect(await CheckoutPage.isShippingDisplayed()).toBe(true);
}

const requiredOnly = {
  fullName: shippingAddress.fullName,
  address1: shippingAddress.address1,
  city: shippingAddress.city,
  zip: shippingAddress.zip,
  country: shippingAddress.country,
};

describe('Checkout form validation', () => {
  beforeEach(async () => {
    await restartApp();
  });

  it('CHK-01 asks a logged-out user to log in, then continues to the shipping form', async () => {
    await CatalogPage.openProduct(backpack.title);
    await ProductPage.addToCart(1);
    await CartPage.open();
    await CartPage.proceedToCheckout();

    expect(await LoginPage.isDisplayed(5_000)).toBe(true);
    await LoginPage.loginAs(users.standard);

    expect(await CheckoutPage.isShippingDisplayed()).toBe(true);
  });

  it('CHK-02 flags every required shipping field when the form is empty', async () => {
    await reachShippingForm();
    await CheckoutPage.fillShipping({});
    await CheckoutPage.submitShipping();

    const errors = await CheckoutPage.shippingErrors();
    expect(Object.keys(errors).sort()).toEqual(
      ['address1', 'city', 'country', 'fullName', 'zip'].sort(),
    );
    expect(errors.fullName).toBe('Please provide your full name.');
    expect(errors.address1).toBe('Please provide your address.');
    expect(errors.city).toBe('Please provide your city.');
    expect(await CheckoutPage.isPaymentDisplayed(2_000)).toBe(false);
  });

  it('CHK-03 accepts the form with only required fields (address line 2 and state optional)', async () => {
    await reachShippingForm();
    await CheckoutPage.fillShipping(requiredOnly);
    await CheckoutPage.submitShipping();

    expect(await CheckoutPage.isPaymentDisplayed()).toBe(true);
  });

  it('CHK-04 flags invalid payment fields when the payment form is empty', async () => {
    await reachShippingForm();
    await CheckoutPage.fillShipping(requiredOnly);
    await CheckoutPage.submitShipping();
    await CheckoutPage.clearPayment();
    await CheckoutPage.submitPayment();

    expect(await CheckoutPage.paymentErrors()).toEqual({
      fullName: true,
      cardNumberIcon: true,
      expiry: true,
      securityCode: true,
    });
    expect(await CheckoutPage.isReviewDisplayed(2_000)).toBe(false);
  });

  it('CHK-05 shows the entered address and the cart on the review screen', async () => {
    // Stops at "Review order". Placing a real order is manual-only (see TEST_MATRIX.md).
    await reachShippingForm();
    await CheckoutPage.fillShipping(requiredOnly);
    await CheckoutPage.submitShipping();
    await CheckoutPage.fillPayment(testCard);
    await CheckoutPage.submitPayment();

    const summary = await CheckoutPage.reviewSummary();
    expect(summary.titles).toEqual([backpack.title]);
    expect(summary.fullName).toBe(shippingAddress.fullName);
    expect(summary.address).toBe(shippingAddress.address1);
    expect(summary.city).toContain(shippingAddress.city);
    expect(summary.country).toContain(shippingAddress.country);
    expect(summary.country).toContain(shippingAddress.zip);
    expect(summary.itemCount).toBe(1);
    // Total = item price + delivery fee, so it must be strictly greater than the item price.
    expect(summary.total).toBeGreaterThan(backpack.price);
  });
});
