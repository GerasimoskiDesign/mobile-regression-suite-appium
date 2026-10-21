import { $, $$ } from '@wdio/globals';
import { cart } from '../selectors/index.js';
import { waitAndTap, textsOf, isPresent } from '../helpers/gestures.js';
import { parsePrice, parseItemCount } from '../helpers/parse.js';
import { timeouts } from '../config/timeouts.js';
import Header from './Header.js';

class CartPage {
  async open() {
    await Header.openCart();
    await $(cart.title).waitForDisplayed({ timeout: timeouts.element });
  }

  async lines() {
    const titles = await textsOf(cart.lineTitles);
    const prices = (await textsOf(cart.linePrices)).map(parsePrice);
    const quantities = (await textsOf(cart.lineQuantities)).map(Number);
    return titles.map((title, i) => ({ title, price: prices[i], quantity: quantities[i] }));
  }

  async itemCount() {
    const el = await $(cart.itemCount);
    await el.waitForDisplayed({ timeout: timeouts.element });
    return parseItemCount(await el.getText());
  }

  async total() {
    return parsePrice(await $(cart.total).getText());
  }

  /** Change the quantity of the line at `index` (0-based) with the +/- buttons. */
  async increase(index = 0) {
    const buttons = await $$(cart.increase);
    await buttons[index].click();
  }

  async decrease(index = 0) {
    const buttons = await $$(cart.decrease);
    await buttons[index].click();
  }

  async removeLine(index = 0) {
    const buttons = await $$(cart.remove);
    await buttons[index].click();
  }

  async isEmpty() {
    return isPresent(cart.emptyTitle, timeouts.element);
  }

  async goShopping() {
    await waitAndTap(cart.goShopping);
  }

  async proceedToCheckout() {
    await waitAndTap(cart.checkout);
  }
}

export default new CartPage();
