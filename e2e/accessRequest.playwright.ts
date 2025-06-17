// MIT License
//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

import { expect } from "@inrupt/internal-playwright-helpers";
import { TESTID_LOGIN_BUTTON } from "@inrupt/internal-playwright-testids";
import { GRANT_VC_URL_PARAM_NAME } from "@inrupt/solid-client-access-grants";
import {
  AMI_URL,
  CLIENT_URL,
  loginWithCookie,
  test as test$,
  TIMEOUT,
} from "./shared";

const test = test$.extend<{
  handleDemoAppIncomingRedirect: () => Promise<void>;
  setupAccessRequest: () => Promise<void>;
}>({
  setup: async ({ page, auth, setup }, use) => {
    await use(async () => {
      await setup();
      // Navigate to demo app
      await page.goto(CLIENT_URL.href);
      await expect(page.getByTestId(TESTID_LOGIN_BUTTON)).toBeVisible({
        timeout: TIMEOUT,
      });
      await auth.login({ allow: true, timeout: TIMEOUT });
      // Wait for create resource button to be available
      await expect(page.getByTestId("create-resource")).toBeVisible({
        timeout: TIMEOUT,
      });
      // Create resource
      await page.getByTestId("create-resource").click();

      const resourceIri = page.getByTestId("resource-iri");
      await expect(resourceIri).toBeVisible({ timeout: TIMEOUT });
      await expect(resourceIri.textContent()).resolves.not.toBe(
        "Resource creation failed",
      );
      // request access to resource
      await page.getByTestId("request-access").click();
      const accessRequestUrl = page.getByTestId("access-request-url");

      await expect(accessRequestUrl).toBeVisible({ timeout: TIMEOUT * 2 });
      // wait for redirect to AMI
      await page.getByTestId("grant-access").click();
      await page.waitForURL(
        (url: URL) =>
          url.hostname === AMI_URL.hostname && url.port === AMI_URL.port,
      );

      await expect(page.locator("h2")).toContainText("Connect with");

      // login to AMI and wait for access request to be visible
      await page.getByTestId("advanced-login").click();
      await loginWithCookie(page);
    });
  },
  setupAccessRequest: async ({ setup, page, visible }, use) => {
    return use(async () => {
      await setup();
      // wait for access request page to load
      await visible(page.getByTestId("access-request-container"));
      await visible(page.getByTestId("access-request-title"));
      await visible(page.getByTestId("loading-modal"), false);
    });
  },
  handleDemoAppIncomingRedirect: async ({ page, auth }, use) => {
    return use(async () => {
      // confirm
      // should be redirected to original app
      await Promise.all([
        page.waitForURL(
          (url: URL) =>
            url.hostname === CLIENT_URL.hostname &&
            url.port === CLIENT_URL.port &&
            url.searchParams.has(GRANT_VC_URL_PARAM_NAME),
        ),
        page.getByTestId("modal-primary-action").click(),
      ]);

      await expect(page.getByTestId(TESTID_LOGIN_BUTTON)).toBeVisible({
        timeout: TIMEOUT,
      });

      // Log back into the test client.
      await auth.login({ allow: true, timeout: TIMEOUT });
    });
  },
});

test("access request approve flow", async ({
  page,
  visible,
  handleDemoAppIncomingRedirect,
  setupAccessRequest,
}) => {
  await setupAccessRequest();

  // select the first toggle purpose (all deselected by default)
  await page.click('[data-testid="toggle-purpose"]');
  // cannot select date greater than requested expiration date
  await page.getByTestId("date-picker-toggle").click();
  await expect(page.getByText("1 Year")).toBeDisabled();
  // Close the date-picker-toggle
  await page.getByTestId("date-picker-toggle").click();
  // Select all modes (all deselected by default)
  await page.getByTestId("select-all-modes-button").click();
  // clicking on confirm should display a modal
  await page.getByTestId("confirm-access").click();

  await visible(page.getByRole("dialog"));

  await handleDemoAppIncomingRedirect();
  // click on handle response should display VC url
  await expect(page.getByTestId("handle-grant-response")).toBeVisible({
    timeout: TIMEOUT,
  });

  await page.getByTestId("handle-grant-response").click();
  await expect(page.getByTestId("access-grant-url")).toBeVisible({
    timeout: TIMEOUT,
  });

  // click on authenticated fetch should display the grant's contents
  await page.getByTestId("get-authed-grant").click();
  await expect(page.getByTestId("access-grant")).toBeVisible({
    timeout: TIMEOUT,
  });

  await page.getByTestId("handle-resource-get-response").click();
  // Confirm that we can read the contents of the file as the requestor app
  await expect(page.getByTestId("resource-body")).toHaveText(
    "Some content.\n",
    {
      timeout: TIMEOUT,
    },
  );

  // Wait for delete resource button to be available
  await expect(page.getByTestId("delete-resource")).toBeVisible({
    timeout: TIMEOUT,
  });
  // Delete resource
  await page.getByTestId("delete-resource").click();
});

test("access request deny flow", async ({
  page,
  handleDemoAppIncomingRedirect,
  visible,
  setupAccessRequest,
}) => {
  await setupAccessRequest();

  // clicking on deny access should display a modal
  await page.getByRole("button", { name: "Deny All Access" }).click();
  await visible(page.getByRole("dialog"));

  // deny confirmation modal
  await page.getByTestId("modal-primary-action").click();
  await visible(page.getByText("Access Request Denied"), true, {
    tags: ["wcag2a", "wcag21a", "wcag21aa"],
  });

  await handleDemoAppIncomingRedirect();

  // Wait for delete resource button to be available
  await expect(page.getByTestId("delete-resource")).toBeVisible({
    timeout: TIMEOUT,
  });
  // Delete resource
  await page.getByTestId("delete-resource").click();
});
