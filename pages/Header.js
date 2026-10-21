import { $ } from '@wdio/globals';
import { header } from '../selectors/index.js';
import { waitAndTap, isPresent } from '../helpers/gestures.js';

/** The toolbar shared by every screen: menu, sort and cart buttons plus the cart badge. */
class Header {
  async openMenu() {
    await waitAndTap(header.menuButton);
  }

  async openSort() {
    await waitAndTap(header.sortButton);
  }

  async openCart() {
    await waitAndTap(header.cartButton);
  }

  /** Number on the cart badge; 0 when the badge is hidden (empty cart). */
  async cartCount() {
    if (!(await isPresent(header.cartBadge))) {
      return 0;
    }
    return Number(await $(header.cartBadge).getText());
  }
}

export default new Header();
