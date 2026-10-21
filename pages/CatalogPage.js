import { $ } from '@wdio/globals';
import { catalog, sort } from '../selectors/index.js';
import { waitAndTap, scrollToText, textsOf } from '../helpers/gestures.js';
import { parsePrice } from '../helpers/parse.js';
import { timeouts } from '../config/timeouts.js';
import Header from './Header.js';

const SORT_OPTIONS = {
  nameAsc: sort.nameAsc,
  nameDesc: sort.nameDesc,
  priceAsc: sort.priceAsc,
  priceDesc: sort.priceDesc,
};

class CatalogPage {
  async waitForLoaded() {
    await $(catalog.list).waitForDisplayed({ timeout: timeouts.appStart });
    await $(catalog.tileTitles).waitForDisplayed({ timeout: timeouts.element });
  }

  async isDisplayed() {
    return $(catalog.list).isDisplayed();
  }

  /** Titles of the tiles currently on screen, in reading order. */
  async visibleTitles() {
    await this.waitForLoaded();
    return textsOf(catalog.tileTitles);
  }

  /** Prices of the tiles currently on screen, parsed to numbers. */
  async visiblePrices() {
    await this.waitForLoaded();
    return (await textsOf(catalog.tilePrices)).map(parsePrice);
  }

  /** @param {'nameAsc'|'nameDesc'|'priceAsc'|'priceDesc'} option */
  async sortBy(option) {
    const selector = SORT_OPTIONS[option];
    if (!selector) {
      throw new Error(`Unknown sort option "${option}"`);
    }
    await Header.openSort();
    await waitAndTap(selector);
    await $(selector).waitForDisplayed({ reverse: true, timeout: timeouts.element });
    await this.waitForLoaded();
  }

  /** Scroll to a product by title and open its detail page. */
  async openProduct(title) {
    await this.waitForLoaded();
    await scrollToText(title);
    await waitAndTap(catalog.scrollToImageOfTitle(title));
  }

  /** Open the first tile on screen and return its title and price as shown in the grid. */
  async openFirstProduct() {
    const [title] = await this.visibleTitles();
    const [price] = await this.visiblePrices();
    await waitAndTap(catalog.tileImages);
    return { title, price };
  }
}

export default new CatalogPage();
