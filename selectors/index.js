/**
 * Single source of truth for every locator in the suite.
 *
 * Page objects import from here and never build selector strings themselves. When the
 * app changes a label or id, this is the only file that needs editing, and
 * `npm run check:selectors` guarantees nobody slips an XPath in somewhere else.
 *
 * Accessibility ids are used wherever the app exposes one; resource ids cover
 * elements without a content-desc (text fields, error labels).
 */
import {
  byA11y,
  byId,
  byIdAndText,
  scrollIntoViewByIdAndText,
  scrollToSiblingOfIdAndText,
} from './strategies.js';

export const header = {
  menuButton: byA11y('View menu'),
  sortButton: byA11y('Shows current sorting order and displays available sorting options'),
  cartButton: byA11y('View cart'),
  cartBadge: byId('cartTV'),
};

export const menu = {
  container: byId('menuRV'),
  login: byA11y('Login Menu Item'),
  logout: byA11y('Logout Menu Item'),
  item: (label) => byIdAndText('itemTV', label),
};

export const dialog = {
  title: byId('alertTitle'),
  message: byId('android:id/message'),
  confirm: byId('android:id/button1'),
  cancel: byId('android:id/button2'),
};

export const login = {
  title: byId('loginTV'),
  username: byId('nameET'),
  password: byId('passwordET'),
  submit: byA11y('Tap to login with given credentials'),
  usernameError: byId('nameErrorTV'),
  passwordError: byId('passwordErrorTV'),
};

export const catalog = {
  title: byId('productTV'),
  list: byA11y('Displays all products of catalog'),
  tileImages: byA11y('Product Image'),
  tileTitles: byA11y('Product Title'),
  tilePrices: byA11y('Product Price'),
  tileByTitle: (title) => byIdAndText('titleTV', title),
  scrollToTitle: (title) => scrollIntoViewByIdAndText('titleTV', title),
  // Only the tile image is tappable; the title text is not.
  scrollToImageOfTitle: (title) => scrollToSiblingOfIdAndText('titleTV', title, 'productIV'),
};

export const sort = {
  nameAsc: byA11y('Ascending order by name'),
  nameDesc: byA11y('Descending order by name'),
  priceAsc: byA11y('Ascending order by price'),
  priceDesc: byA11y('Descending order by price'),
};

export const product = {
  title: byId('productTV'),
  price: byId('priceTV'),
  image: byA11y('Displays selected product'),
  quantity: byId('noTV'),
  increase: byA11y('Increase item quantity'),
  decrease: byA11y('Decrease item quantity'),
  addToCart: byA11y('Tap to add product to cart'),
};

export const cart = {
  title: byId('productTV'),
  lineTitles: byId('titleTV'),
  linePrices: byId('priceTV'),
  lineQuantities: byId('noTV'),
  increase: byA11y('Increase item quantity'),
  decrease: byA11y('Decrease item quantity'),
  remove: byA11y('Removes product from cart'),
  itemCount: byId('itemsTV'),
  total: byId('totalPriceTV'),
  checkout: byA11y('Confirms products for checkout'),
  emptyTitle: byId('noItemTitleTV'),
  goShopping: byId('shoppingBt'),
};

export const shipping = {
  title: byId('checkoutTitleTV'),
  fullName: byId('fullNameET'),
  address1: byId('address1ET'),
  address2: byId('address2ET'),
  city: byId('cityET'),
  state: byId('stateET'),
  zip: byId('zipET'),
  country: byId('countryET'),
  submit: byA11y('Saves user info for checkout'),
  errors: {
    fullName: byId('fullNameErrorTV'),
    address1: byId('address1ErrorTV'),
    city: byId('cityErrorTV'),
    zip: byId('zipErrorTV'),
    country: byId('countryErrorTV'),
  },
};

export const payment = {
  heading: byId('enterPaymentMethodTV'),
  fullName: byId('nameET'),
  cardNumber: byId('cardNumberET'),
  expiry: byId('expirationDateET'),
  securityCode: byId('securityCodeET'),
  submit: byA11y('Saves payment info and launches screen to review checkout data'),
  errors: {
    fullName: byId('nameErrorTV'),
    cardNumberIcon: byId('cardNumberErrorIV'),
    expiry: byId('expirationDateErrorTV'),
    securityCode: byId('securityCodeErrorTV'),
  },
};

export const review = {
  heading: byId('enterShippingAddressTV'),
  lineTitles: byId('titleTV'),
  fullName: byId('fullNameTV'),
  address: byId('addressTV'),
  city: byId('cityTV'),
  country: byId('countryTV'),
  itemCount: byId('itemNumberTV'),
  total: byId('totalAmountTV'),
  placeOrder: byA11y('Completes the process of checkout'),
};
