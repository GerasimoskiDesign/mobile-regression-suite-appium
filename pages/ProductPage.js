import { $ } from '@wdio/globals';
import { product } from '../selectors/index.js';
import { waitAndTap } from '../helpers/gestures.js';
import { parsePrice } from '../helpers/parse.js';
import { timeouts } from '../config/timeouts.js';

class ProductPage {
  async waitForLoaded() {
    await $(product.addToCart).waitForDisplayed({ timeout: timeouts.element });
  }

  async title() {
    await this.waitForLoaded();
    return $(product.title).getText();
  }

  async price() {
    await this.waitForLoaded();
    return parsePrice(await $(product.price).getText());
  }

  async quantity() {
    return Number(await $(product.quantity).getText());
  }

  async increase(times = 1) {
    for (let i = 0; i < times; i += 1) {
      await waitAndTap(product.increase);
    }
  }

  async decrease(times = 1) {
    for (let i = 0; i < times; i += 1) {
      await waitAndTap(product.decrease);
    }
  }

  /** Set the quantity picker to `quantity` (starting from the default of 1), then add to cart. */
  async addToCart(quantity = 1) {
    await this.waitForLoaded();
    const current = await this.quantity();
    if (quantity > current) {
      await this.increase(quantity - current);
    } else if (quantity < current) {
      await this.decrease(current - quantity);
    }
    await waitAndTap(product.addToCart);
  }
}

export default new ProductPage();
