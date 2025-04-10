//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import {
  test as test$1,
  expect as expect$1,
  OpenIdPage,
} from "@inrupt/internal-playwright-helpers";
import AxeBuilder from "@axe-core/playwright";
import { Locator, Page } from "@playwright/test";
import {
  TESTID_OPENID_PROVIDER_INPUT,
  TESTID_LOGIN_BUTTON,
} from "@inrupt/internal-playwright-testids";
import { getNodeTestingEnvironment } from "@inrupt/internal-test-env";

const test = test$1.extend<{
  axe: AxeBuilder;
  analyze: (_options?: { tags?: string[] }) => Promise<void>;
  visible: (
    _locator: Locator,
    _not?: boolean,
    _options?: { tags?: string[] }
  ) => Promise<void>;
  setup: () => Promise<void>;
}>({
  axe: async ({ page }, use) => {
    const axe = new AxeBuilder({
      page,
    });
    await use(axe);
  },
  analyze: async ({ axe }, use) => {
    await use(({ tags }: { tags?: string[] } = {}) =>
      expect$1(
        axe
          .withTags(tags ?? ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).resolves.toMatchObject({ violations: [] })
    );
  },
  visible: async ({ analyze }, use) => {
    await use(async (locator, not, { tags }: { tags?: string[] } = {}) => {
      await (not === false
        ? expect$1(locator).not
        : expect$1(locator)
      ).toBeVisible({
        timeout: TIMEOUT,
      });
      // Perform an accessibility check after every time we check for an elements visibility
      await analyze({ tags });
    });
  },
  setup: async ({ visible, page }, use) => {
    await use(async () => {
      await page.waitForTimeout(500); // apparently the line below is not sufficient for Firefox in some cases
      await page.waitForLoadState(); // this is necessary due to a potential bug: https://github.com/microsoft/playwright/issues/2061

      // Waiting for AMI to fully load
      await visible(page.locator("h2"));
      await expect$1(page.locator("h2")).toContainText("Connect with");
    });
  },
});

export { test, expect$1 as expect };

export const setupEnvironment = getNodeTestingEnvironment();
export const TIMEOUT = 60_000 * 3;
export const AMI_URL = new URL("http://localhost:3000");
export const CLIENT_URL = new URL("http://localhost:8080");
export const loginWithCookie = async (page: Page) => {
  const opBroker = new OpenIdPage(page);
  // This goes through the login flow for an already authenticated session
  // that will not go through the underlying OpenID Provider.
  await page
    .getByTestId(TESTID_OPENID_PROVIDER_INPUT)
    .fill(setupEnvironment.idp);
  await page.getByTestId(TESTID_LOGIN_BUTTON).click();
  await opBroker.allow({ timeout: TIMEOUT });
};
