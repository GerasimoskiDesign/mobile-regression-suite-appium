import { expect } from '@wdio/globals';
import LoginPage from '../../pages/LoginPage.js';
import MenuPage from '../../pages/MenuPage.js';
import CatalogPage from '../../pages/CatalogPage.js';
import { restartApp } from '../../helpers/app.js';
import { users } from '../../data/users.js';

describe('Login', () => {
  beforeEach(async () => {
    await restartApp();
    await MenuPage.openLogin();
    await LoginPage.waitForDisplayed();
  });

  it('LOGIN-01 logs in with valid credentials and lands on the catalog', async () => {
    await LoginPage.loginAs(users.standard);

    await CatalogPage.waitForLoaded();
    expect(await MenuPage.isLoggedIn()).toBe(true);
  });

  it('LOGIN-02 rejects an empty username', async () => {
    await LoginPage.submit('', users.standard.password);

    expect(await LoginPage.usernameError()).toBe('Username is required');
    expect(await LoginPage.isDisplayed()).toBe(true);
  });

  it('LOGIN-03 rejects an empty password', async () => {
    await LoginPage.submit(users.standard.username, '');

    expect(await LoginPage.passwordError()).toBe('Enter Password');
    expect(await LoginPage.isDisplayed()).toBe(true);
  });

  it('LOGIN-04 blocks a locked-out user with a clear message', async () => {
    await LoginPage.submit(users.lockedOut.username, users.lockedOut.password);

    expect(await LoginPage.passwordError()).toBe('Sorry this user has been locked out.');
    expect(await LoginPage.isDisplayed()).toBe(true);
  });
});
