import { $ } from '@wdio/globals';
import { shipping, payment, review } from '../selectors/index.js';
import { waitAndTap, replaceText, typeSlowly, isPresent, textsOf } from '../helpers/gestures.js';
import { hideKeyboardIfShown } from '../helpers/app.js';
import { parsePrice, parseItemCount } from '../helpers/parse.js';
import { timeouts } from '../config/timeouts.js';

const SHIPPING_FIELDS = ['fullName', 'address1', 'address2', 'city', 'state', 'zip', 'country'];

/** Shipping address -> payment -> review. One page object per step would be three tiny files. */
class CheckoutPage {
  async isShippingDisplayed(timeout = timeouts.element) {
    return isPresent(shipping.submit, timeout);
  }

  /** Fill only the keys present in `address`; others are cleared so validation sees them empty. */
  async fillShipping(address) {
    await $(shipping.submit).waitForDisplayed({ timeout: timeouts.element });
    for (const field of SHIPPING_FIELDS) {
      await replaceText(shipping[field], address[field] ?? '');
    }
    await hideKeyboardIfShown();
  }

  async submitShipping() {
    await waitAndTap(shipping.submit);
  }

  /** Visible shipping error messages keyed by field. */
  async shippingErrors() {
    const errors = {};
    for (const [field, selector] of Object.entries(shipping.errors)) {
      if (await isPresent(selector, timeouts.probe)) {
        errors[field] = await $(selector).getText();
      }
    }
    return errors;
  }

  async isPaymentDisplayed(timeout = timeouts.element) {
    return isPresent(payment.submit, timeout);
  }

  /** Card fields reformat on each keystroke, so they are typed slowly. */
  async fillPayment(card) {
    await $(payment.submit).waitForDisplayed({ timeout: timeouts.element });
    await replaceText(payment.fullName, card.fullName ?? '');
    await typeSlowly(payment.cardNumber, card.number ?? '');
    await typeSlowly(payment.expiry, card.expiry ?? '');
    await typeSlowly(payment.securityCode, card.securityCode ?? '');
    await hideKeyboardIfShown();
  }

  async clearPayment() {
    await this.fillPayment({});
  }

  async submitPayment() {
    await waitAndTap(payment.submit);
  }

  /** Which payment validation markers are visible. */
  async paymentErrors() {
    const errors = {};
    for (const [field, selector] of Object.entries(payment.errors)) {
      errors[field] = await isPresent(selector, timeouts.probe);
    }
    return errors;
  }

  async isReviewDisplayed(timeout = timeouts.element) {
    return isPresent(review.placeOrder, timeout);
  }

  async reviewSummary() {
    await $(review.placeOrder).waitForDisplayed({ timeout: timeouts.element });
    return {
      titles: await textsOf(review.lineTitles),
      fullName: await $(review.fullName).getText(),
      address: await $(review.address).getText(),
      city: await $(review.city).getText(),
      country: await $(review.country).getText(),
      itemCount: parseItemCount(await $(review.itemCount).getText()),
      total: parsePrice(await $(review.total).getText()),
    };
  }
}

export default new CheckoutPage();
