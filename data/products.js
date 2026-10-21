/**
 * Catalog facts the specs rely on. Taken from the public demo app (release pinned in
 * scripts/fetch-app.js); if the app is upgraded and these change, the catalog and
 * sort specs fail with a clear message instead of silently testing something else.
 *
 * KNOWN DEFECT (see docs/TEST_MATRIX.md, KNOWN-01): in releases 2.2.0 and 2.3.0, tapping
 * the catalog tile in grid position 2, or any tile from position 5 on, crashes the app
 * (NullPointerException / ArrayIndexOutOfBoundsException in ProductCatalogFragment).
 * Positions 1, 3 and 4 open correctly. The flows below therefore only open products
 * that sit in those positions, and the defect itself is covered by a quarantined test.
 */
export const products = {
  // Positions in the default (name ascending) grid, 1-based.
  backpack: { title: 'Sauce Labs Backpack', price: 29.99, position: 1 },
  backpackOrange: { title: 'Sauce Labs Backpack (orange)', price: 29.99, position: 3 },
  backpackRed: { title: 'Sauce Labs Backpack (red)', price: 29.99, position: 4 },
  // First tile after sorting by price ascending.
  onesie: { title: 'Sauce Labs Onesie', price: 7.99 },
  // Position 2 in the default grid: opening it triggers KNOWN-01.
  backpackGreen: { title: 'Sauce Labs Backpack (green)', price: 29.99, position: 2 },
};

/** Last product in the default (name ascending) order: proves scrolling reached the end. */
export const lastProductByName = 'Test.allTheThings() T-Shirt (yellow)';
export const cheapestPrice = 7.99;
export const mostExpensivePrice = 49.99;
