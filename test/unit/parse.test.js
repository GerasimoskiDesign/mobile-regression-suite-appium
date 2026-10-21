import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePrice,
  parseItemCount,
  sumMoney,
  multiplyMoney,
  isSorted,
  byCodeUnits,
  reverse,
  ascending,
  descending,
} from '../../helpers/parse.js';
import { slugify } from '../../helpers/artifacts.js';

test('parsePrice reads the app price labels', () => {
  assert.equal(parsePrice('$ 29.99'), 29.99);
  assert.equal(parsePrice('$7.99'), 7.99);
  assert.equal(parsePrice('  $ 120 '), 120);
});

test('parsePrice fails loudly on anything that is not a price', () => {
  for (const bad of ['', '29.99', '$', 'USD 29.99', '$ 29,99', '$ -1.00', '$ 1.999']) {
    assert.throws(() => parsePrice(bad), /Not a price label/, bad);
  }
});

test('parseItemCount handles singular and plural', () => {
  assert.equal(parseItemCount('1 Item'), 1);
  assert.equal(parseItemCount('3 Items'), 3);
  assert.throws(() => parseItemCount('Items: 3'));
});

test('money helpers avoid floating point drift', () => {
  assert.notEqual(0.1 + 0.2, 0.3); // the bug these helpers exist for
  assert.equal(multiplyMoney(29.99, 3), 89.97);
  assert.equal(sumMoney([29.99, 7.99, 7.99]), 45.97);
  assert.equal(sumMoney([0.1, 0.2]), 0.3);
  assert.equal(sumMoney([]), 0);
});

test('isSorted accepts ties and rejects inversions', () => {
  assert.equal(isSorted([7.99, 9.99, 15.99, 15.99], ascending), true);
  assert.equal(isSorted([49.99, 49.99, 29.99], descending), true);
  assert.equal(isSorted([9.99, 7.99], ascending), false);
  assert.equal(isSorted([], ascending), true);
  assert.equal(isSorted([1], descending), true);
});

test('name order mirrors Java String.compareTo, not localeCompare', () => {
  // Upper-case letters sort before lower-case ones in code-unit order.
  assert.equal(isSorted(['Sauce Labs Onesie', 'Test.allTheThings() T-Shirt'], byCodeUnits), true);
  assert.equal(isSorted(['Zebra', 'apple'], byCodeUnits), true);
  assert.equal(isSorted(['apple', 'Zebra'], byCodeUnits), false);
  assert.equal(['apple', 'Zebra'].sort((a, b) => a.localeCompare(b))[0], 'apple');
  const desc = ['Test (yellow)', 'Test (turquoise)', 'Test (purple)', 'Test (pink)'];
  assert.equal(isSorted(desc, reverse(byCodeUnits)), true);
});

test('slugify makes safe, bounded file names for failure artifacts', () => {
  assert.equal(slugify('CART-02 lists the "added" product!'), 'cart-02-lists-the-added-product');
  assert.equal(slugify('***'), 'test');
  assert.equal(slugify('a'.repeat(200)).length, 80);
});
