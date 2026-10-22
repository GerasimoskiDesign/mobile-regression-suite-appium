# Test matrix

Every regression case, automated or not, with the reason it is (not) automated. The same
classification drove the original project: UI-only cases were automated first, cases that
need a backend or a one-time code stay manual until a test hook exists, and anything that
moves real money stays manual on purpose.

Types:

- **UI-only**: everything needed is on the device; no external system is involved.
- **needs-backend**: depends on a server-side system (SMS gateway, order service, push
  service) that has to be stubbed or given a test hook before it can be automated.
- **manual-only**: kept manual by decision (real payments, physical hardware, visual judgement).

`test/unit/test-matrix.test.js` keeps this file honest: every automated row must exist as a
test in the named spec file, every test in the specs must have a row here, and the summary
below must match the table. Regenerate the summary with `npm run matrix`.

<!-- summary:start -->

| Total cases | Automated | of which quarantined | Not automated | UI-only | needs-backend | manual-only |
| ----------- | --------- | -------------------- | ------------- | ------- | ------------- | ----------- |
| 43          | 30        | 1                    | 13            | 33      | 5             | 5           |

<!-- summary:end -->

| ID       | Area        | Case                                                               | Type          | Automated? | Spec file                   |
| -------- | ----------- | ------------------------------------------------------------------ | ------------- | ---------- | --------------------------- |
| LOGIN-01 | Login       | Valid credentials log in and land on the catalog                   | UI-only       | yes        | test/specs/login.spec.js    |
| LOGIN-02 | Login       | Empty username shows "Username is required"                        | UI-only       | yes        | test/specs/login.spec.js    |
| LOGIN-03 | Login       | Empty password shows "Enter Password"                              | UI-only       | yes        | test/specs/login.spec.js    |
| LOGIN-04 | Login       | Locked-out user is blocked with a clear message                    | UI-only       | yes        | test/specs/login.spec.js    |
| LOGIN-05 | Login       | Login with a one-time code sent by SMS                             | needs-backend | no         | -                           |
| LOGIN-06 | Login       | Password reset link sent by email                                  | needs-backend | no         | -                           |
| LOGIN-07 | Login       | Fingerprint login                                                  | UI-only       | no         | -                           |
| CAT-01   | Catalog     | Tiles show a title and a valid price                               | UI-only       | yes        | test/specs/catalog.spec.js  |
| CAT-02   | Catalog     | Scrolling reaches the last product                                 | UI-only       | yes        | test/specs/catalog.spec.js  |
| CAT-03   | Catalog     | Prices and stock match the product backend                         | needs-backend | no         | -                           |
| SORT-01  | Sort        | Name ascending                                                     | UI-only       | yes        | test/specs/sort.spec.js     |
| SORT-02  | Sort        | Name descending                                                    | UI-only       | yes        | test/specs/sort.spec.js     |
| SORT-03  | Sort        | Price ascending, cheapest first                                    | UI-only       | yes        | test/specs/sort.spec.js     |
| SORT-04  | Sort        | Price descending, most expensive first                             | UI-only       | yes        | test/specs/sort.spec.js     |
| PDP-01   | Product     | Detail page matches the tile's title and price                     | UI-only       | yes        | test/specs/product.spec.js  |
| PDP-02   | Product     | Plus / minus change the quantity                                   | UI-only       | yes        | test/specs/product.spec.js  |
| PDP-03   | Product     | Quantity 0 adds nothing to the cart                                | UI-only       | yes        | test/specs/product.spec.js  |
| PDP-04   | Product     | Product in grid position 2 opens without crashing (KNOWN-01)       | UI-only       | yes        | test/specs/product.spec.js  |
| CART-01  | Cart        | Badge shows the added quantity                                     | UI-only       | yes        | test/specs/cart.spec.js     |
| CART-02  | Cart        | Line title, price, item count and total are correct                | UI-only       | yes        | test/specs/cart.spec.js     |
| CART-03  | Cart        | Quantity changes in the cart recalculate count and total           | UI-only       | yes        | test/specs/cart.spec.js     |
| CART-04  | Cart        | Two different products sum into one total                          | UI-only       | yes        | test/specs/cart.spec.js     |
| CART-05  | Cart        | Removing the last item shows the empty state                       | UI-only       | yes        | test/specs/cart.spec.js     |
| CHK-01   | Checkout    | Logged-out checkout asks for login, then continues                 | UI-only       | yes        | test/specs/checkout.spec.js |
| CHK-02   | Checkout    | Empty shipping form flags all five required fields                 | UI-only       | yes        | test/specs/checkout.spec.js |
| CHK-03   | Checkout    | Address line 2 and state are optional                              | UI-only       | yes        | test/specs/checkout.spec.js |
| CHK-04   | Checkout    | Empty payment form flags the card fields                           | UI-only       | yes        | test/specs/checkout.spec.js |
| CHK-05   | Checkout    | Review screen shows the entered address, the cart and the total    | UI-only       | yes        | test/specs/checkout.spec.js |
| CHK-06   | Checkout    | Place an order with a real card (payment provider, 3-D Secure)     | manual-only   | no         | -                           |
| CHK-07   | Checkout    | Order confirmation arrives by email / SMS                          | needs-backend | no         | -                           |
| CHK-08   | Checkout    | Cancel and refund a placed order                                   | manual-only   | no         | -                           |
| SES-01   | Session     | Logout through the menu returns to the login screen                | UI-only       | yes        | test/specs/session.spec.js  |
| SES-02   | Session     | Cancelling the logout dialog keeps the session                     | UI-only       | yes        | test/specs/session.spec.js  |
| SES-03   | Session     | `ensureLoggedIn()` does nothing while the session is valid         | UI-only       | yes        | test/specs/session.spec.js  |
| SES-04   | Session     | `ensureLoggedIn()` recovers from a forced logout mid-flow          | UI-only       | yes        | test/specs/session.spec.js  |
| RST-01   | Restart     | Background and resume keep cart and session                        | UI-only       | yes        | test/specs/restart.spec.js  |
| RST-02   | Restart     | Cold restart starts clean; `ensureLoggedIn()` restores the session | UI-only       | yes        | test/specs/restart.spec.js  |
| DEV-01   | Device      | Push notification opens the right screen                           | needs-backend | no         | -                           |
| DEV-02   | Device      | QR code scanner with the physical camera                           | manual-only   | no         | -                           |
| DEV-03   | Device      | Geo location screen with a mocked GPS position                     | UI-only       | no         | -                           |
| DEV-04   | Device      | Drawing pad accepts a signature                                    | UI-only       | no         | -                           |
| UX-01    | Look & feel | Layout on a small screen and in dark mode                          | manual-only   | no         | -                           |
| UX-02    | Look & feel | Screen reader reads every control in a sensible order              | manual-only   | no         | -                           |

## Why the not-automated rows are not automated

| ID       | Reason                                                                                 | What would unlock it                                    |
| -------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| LOGIN-05 | The code arrives by SMS. Reading it from a real phone is slow and flaky.               | A test-only endpoint that returns the last code issued. |
| LOGIN-06 | Needs a mailbox the suite can read.                                                    | A catch-all test mailbox with an API.                   |
| LOGIN-07 | Needs a fingerprint enrolled on the emulator image first.                              | Enrol once in the AVD, then `adb emu finger touch`.     |
| CAT-03   | The demo app ships its catalog inside the APK; there is no backend to compare against. | A product API to read the expected values from.         |
| CHK-06   | Real money and a bank challenge screen. Kept manual on purpose.                        | Nothing: stays manual, run once per release.            |
| CHK-07   | Depends on the notification service.                                                   | Same test mailbox / SMS hook as LOGIN-05/06.            |
| CHK-08   | Needs a real order in the payment system.                                              | Nothing: stays manual.                                  |
| DEV-01   | Needs the push service to send to the test device.                                     | A test sender with a fixed device token.                |
| DEV-02   | Needs a real camera pointed at a real code.                                            | Nothing: stays manual.                                  |
| DEV-03   | Can be automated with Appium's `setGeoLocation`; not done yet.                         | Next candidate for automation.                          |
| DEV-04   | Can be automated with a W3C pointer action; not done yet.                              | Next candidate for automation.                          |
| UX-01    | Visual judgement.                                                                      | Visual regression tooling, out of scope here.           |
| UX-02    | Needs a person using TalkBack.                                                         | Nothing: stays manual.                                  |

## Known defects

| ID       | Found by | Description                                                                                                                                                                                                                                            | Status                                                                                |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| KNOWN-01 | PDP-04   | In app releases 2.2.0 and 2.3.0, tapping the catalog tile in grid position 2, or any tile from position 5 onwards, crashes the app (`NullPointerException` / `ArrayIndexOutOfBoundsException` in `ProductCatalogFragment`). Positions 1, 3 and 4 work. | Open upstream. PDP-04 is tagged `@known-defect` and quarantined from the default run. |

## Verified runs

The automated rows above were run end to end on app release 2.3.0 (default run: 29 tests in
8 spec files; the quarantined `PDP-04` runs separately with `npm run test:known-defects`).

| Where                                          | Passed | Failed | Spec-file retries used | Test time   |
| ---------------------------------------------- | ------ | ------ | ---------------------- | ----------- |
| Local Pixel 7 emulator, Android 14 (API 34)    | 29     | 0      | 0                      | 8 min 50 s  |
| GitHub Actions `e2e-android` (emulator API 34) | 29     | 0      | 0                      | 13 min 21 s |
