import { expect } from '@wdio/globals';
import CatalogPage from '../../pages/CatalogPage.js';
import ProductPage from '../../pages/ProductPage.js';
import CartPage from '../../pages/CartPage.js';
import Header from '../../pages/Header.js';
import { restartApp } from '../../helpers/app.js';
import MenuPage from '../../pages/MenuPage.js';
import { multiplyMoney, sumMoney } from '../../helpers/parse.js';
import { products } from '../../data/products.js';

const { backpack, onesie } = products;

async function addProduct(item, quantity) {
  await CatalogPage.openProduct(item.title);
  await ProductPage.addToCart(quantity);
}

describe('Cart', () => {
  beforeEach(async () => {
    await restartApp();
  });

  it('CART-01 updates the cart badge with the added quantity', async () => {
    expect(await Header.cartCount()).toBe(0);

    await addProduct(backpack, 2);

    expect(await Header.cartCount()).toBe(2);
  });

  it('CART-02 lists the added product with correct line price, count and total', async () => {
    await addProduct(backpack, 2);
    await CartPage.open();

    const lines = await CartPage.lines();
    expect(lines).toEqual([{ title: backpack.title, price: backpack.price, quantity: 2 }]);
    expect(await CartPage.itemCount()).toBe(2);
    expect(await CartPage.total()).toBe(multiplyMoney(backpack.price, 2));
  });

  it('CART-03 recalculates count and total when quantity changes in the cart', async () => {
    await addProduct(backpack, 1);
    await CartPage.open();

    await CartPage.increase(0);
    await CartPage.increase(0);
    expect(await CartPage.itemCount()).toBe(3);
    expect(await CartPage.total()).toBe(multiplyMoney(backpack.price, 3));
    expect(await Header.cartCount()).toBe(3);

    await CartPage.decrease(0);
    expect(await CartPage.itemCount()).toBe(2);
    expect(await CartPage.total()).toBe(multiplyMoney(backpack.price, 2));
  });

  it('CART-04 sums two different products into one total', async () => {
    await addProduct(backpack, 1);
    await MenuPage.goTo('Catalog');
    // Sorting puts the second product in a grid position that opens reliably (KNOWN-01).
    await CatalogPage.sortBy('priceAsc');
    await addProduct(onesie, 2);
    await CartPage.open();

    const titles = (await CartPage.lines()).map((line) => line.title).sort();
    expect(titles).toEqual([backpack.title, onesie.title].sort());
    expect(await CartPage.itemCount()).toBe(3);
    expect(await CartPage.total()).toBe(sumMoney([backpack.price, multiplyMoney(onesie.price, 2)]));
  });

  it('CART-05 shows the empty state after removing the last item and returns to shopping', async () => {
    await addProduct(backpack, 1);
    await CartPage.open();

    await CartPage.removeLine(0);

    expect(await CartPage.isEmpty()).toBe(true);
    expect(await Header.cartCount()).toBe(0);
    await CartPage.goShopping();
    await CatalogPage.waitForLoaded();
  });
});
