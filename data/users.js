/**
 * Test accounts. These are the public demo accounts printed on the app's own login
 * screen, not real credentials. The values can be overridden through environment
 * variables (see .env.example) so the same specs could run against another build.
 */
export const users = {
  standard: {
    username: process.env.STANDARD_USERNAME || 'bod@example.com',
    password: process.env.STANDARD_USER_PASSWORD || '10203040',
  },
  lockedOut: {
    username: process.env.LOCKED_USERNAME || 'alice@example.com',
    password: process.env.LOCKED_USER_PASSWORD || '10203040',
  },
};

/** Shipping data: obviously fake. */
export const shippingAddress = {
  fullName: 'Test Customer',
  address1: '1 Example Street',
  address2: 'Floor 2',
  city: 'Sampletown',
  state: 'Demo Region',
  zip: '10001',
  country: 'Testland',
};

/** A card number the app's client-side validation accepts. Never a real card. */
export const testCard = {
  fullName: 'Test Customer',
  number: '4111111111111111',
  expiry: '1230',
  securityCode: '123',
};
