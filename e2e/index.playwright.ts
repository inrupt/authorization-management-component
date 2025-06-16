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

import { getBrowserTestingEnvironment } from "@inrupt/internal-test-env";
import { AMI_URL, test, TIMEOUT } from "./shared";

let endSessionEndpoint: string;

test.beforeAll(async () => {
  const response = await (
    await fetch(
      new URL(
        ".well-known/openid-configuration",
        getBrowserTestingEnvironment().idp,
      ),
    )
  ).json();
  endSessionEndpoint = response.end_session_endpoint;
});

test("user can login into the application", async ({
  page,
  auth,
  visible,
  setup,
}) => {
  const login = async () => {
    await page.getByTestId("advanced-login").click();
    await auth.login({ allow: true, timeout: TIMEOUT });
    await page.getByTestId("agent-list-header");
    await visible(page.getByText("Manage Access"));
  };

  await setup();
  await login();

  const endpointRequest = page.waitForRequest((request) =>
    request.url().startsWith(endSessionEndpoint),
  );
  await page.getByTestId("logout-button").click();
  // Redirect through the idp logout page
  await endpointRequest;

  await page.waitForURL(new URL("login?returnTo=%2F", AMI_URL).href);

  // Land back at the applications login page
  await login();
});
