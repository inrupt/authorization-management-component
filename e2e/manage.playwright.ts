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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { expect } from "@inrupt/internal-playwright-helpers";
import {
  getNodeTestingEnvironment,
  getPodRoot,
} from "@inrupt/internal-test-env";
import {
  deleteFile,
  getSourceUrl,
  saveFileInContainer,
} from "@inrupt/solid-client";
import {
  approveAccessRequest,
  getFile as getFileUsingAccessGrant,
  issueAccessRequest,
} from "@inrupt/solid-client-access-grants";
import { Session } from "@inrupt/solid-client-authn-node";
import { v4 } from "uuid";
import { AMI_URL, TIMEOUT, test } from "./shared";
import {
  getFromWebIdHelper,
  namePredicates,
} from "../src/helpers/profile/profile";
// eslint-disable-next-line import/no-relative-packages
import { retryAsync } from "./test-app/src/utils";

const setupEnvironment = getNodeTestingEnvironment();

function assertNonNull<T>(input: T | null | undefined): T {
  if (input === null || input === undefined)
    throw new Error("Unexpected null input");

  return input;
}

async function createLoggedInSession(params: { id?: string; secret?: string }) {
  return retryAsync(async () => {
    const session = new Session();
    await session.login({
      oidcIssuer: setupEnvironment.idp,
      clientId: params.id,
      clientSecret: params.secret,
      // Note that currently, using a Bearer token (as opposed to a DPoP one)
      // is required for the UMA access token to be usable.
      tokenType: "Bearer",
    });
    return session;
  });
}

async function createAccessGrant(
  owner: Session,
  requestor: Session,
  resource: string,
  // Lifetime of the access grant in minutes
  timeout = 20
) {
  const request = await retryAsync(async () =>
    issueAccessRequest(
      {
        resourceOwner: assertNonNull(owner.info.webId),
        access: { read: true },
        expirationDate: new Date(Date.now() + timeout * 60 * 1000),
        resources: [resource],
        purpose: [
          "https://w3id.org/dpv#UserInterfacePersonalisation",
          "https://w3id.org/dpv#OptimiseUserInterface",
        ],
      },
      {
        fetch: requestor.fetch,
      }
    )
  );

  const grant = await retryAsync(() =>
    approveAccessRequest(request.id, undefined, { fetch: owner.fetch })
  );

  return grant;
}

async function createResource(owner: Session, root: string) {
  // Create a resource and issue a VC to access it from the requestor
  const fileName = v4();
  const fileContent = v4();

  // Saving file in the container and issue the requestor an access grant
  const file = await retryAsync(() =>
    saveFileInContainer(root, new File([fileContent], fileName), {
      slug: fileName,
      fetch: owner.fetch,
    })
  );
  return { sharedFileIri: getSourceUrl(file), fileContent, fileName };
}

async function removeResource(owner: Session, resource: string) {
  return await retryAsync(() => deleteFile(resource, { fetch: owner.fetch }));
}

async function setup() {
  if (
    setupEnvironment.clientCredentials.owner.type !== "ESS Client Credentials"
  ) {
    throw new Error("Test suite only works against ESS");
  }

  if (setupEnvironment.clientCredentials.requestor === undefined) {
    throw new Error("requestor required to run this test");
  }
  const owner = await createLoggedInSession(
    setupEnvironment.clientCredentials.owner
  );
  const requestor = await createLoggedInSession(
    setupEnvironment.clientCredentials.requestor
  );
  const requestorName = await retryAsync(() =>
    getFromWebIdHelper(assertNonNull(requestor.info.webId), namePredicates, {
      fetch: requestor.fetch,
    })
  );
  const root = await retryAsync(() => getPodRoot(owner));
  const { sharedFileIri, fileContent } = await createResource(owner, root);
  const grant = await createAccessGrant(owner, requestor, sharedFileIri);
  return {
    requestorName,
    grant,
    owner,
    requestor,
    sharedFileIri,
    fileContent,
    root,
  };
}

let env: Awaited<ReturnType<typeof setup>>;

test.beforeAll(async () => {
  // Do not await here. We want to start the VC
  // whilst we perform login with the application
  env = await setup();
});

test.afterAll(async () => {
  const { owner, requestor, sharedFileIri } = env;
  await removeResource(owner, sharedFileIri);
  await Promise.all([owner.logout(), requestor.logout()]);
});

test("manage page", async ({ page, auth, visible, setup }) => {
  await setup();

  await page.click("button[data-testid=advanced-login]");

  // Make sure the access grants is made before completing login
  const { requestorName, requestor } = env;

  // Wait for navigation after login
  await page.waitForURL(new URL("*", AMI_URL).toString());

  if (!requestorName) {
    // eslint-disable-next-line no-console
    console.warn(
      "Running E2E test with an inaccessible pretty name for the requestor"
    );
  }

  await page.goto(AMI_URL.href);
  await page.getByTestId("advanced-login").click();
  await auth.login({ allow: true, timeout: TIMEOUT });

  async function testSearch(str: string) {
    await page.getByTestId("agent-search-input").fill(str, {
      timeout: TIMEOUT,
    });
    await visible(
      page.getByTestId(`agent-row[${assertNonNull(requestor.info.webId)}]`)
    );
    if (requestorName) {
      await expect(page.getByTestId("agent-name")).toContainText(requestorName);
    }
  }

  await visible(page.getByTestId("loading-spinner"), false);

  await testSearch("");

  // Searching by the full webId
  await testSearch(assertNonNull(requestor.info.webId));

  // Searching by the last value after / in the WebId
  const pathElems = assertNonNull(requestor.info.webId).split("/");
  await testSearch(pathElems[pathElems.length - 1]);

  // Search by first part of name
  await testSearch(
    (requestorName ?? assertNonNull(requestor.info.webId)).split(" ")[0]
  );

  // Should not be visible when searching for a UUID that should not be in the URL or requestor name
  await page.getByTestId("agent-search-input").fill(v4());
  await visible(
    page.getByTestId(`agent-row[${assertNonNull(requestor.info.webId)}]`),
    false
  );
});

const TEST_USER_AGENT = `Node-based authorisation-management-interface end-to-end tests running ${
  process.env.CI === "true" ? "in CI" : "locally"
}`;
const addUserAgent =
  (myFetch: typeof fetch, agent: string) =>
  (input: RequestInfo | URL, init?: RequestInit | undefined) =>
    myFetch(input, {
      ...init,
      headers: { ...init?.headers, "User-Agent": agent },
    });

test("resources page", async ({ page, auth, visible, setup, browserName }) => {
  await setup();
  // Check to make sure we never redirect through the home page
  page.on("request", (request) => {
    expect(request.url()).not.toEqual(AMI_URL.toString());
  });
  page.on("response", (response) => {
    expect(response.url()).not.toEqual(AMI_URL.toString());
  });

  const { requestor, owner, root } = env;

  // We are going to delete this so make sure it is a different resource and grant
  // to the one used to perform the other management tests
  const { sharedFileIri, fileContent, fileName } = await createResource(
    owner,
    root
  );

  // We only need to keep this access grant alive for 2 minutes as tests have a 2.5
  // minute timeout
  const grant = await createAccessGrant(owner, requestor, sharedFileIri, 2.5);

  const sharedFile = await retryAsync(() =>
    getFileUsingAccessGrant(sharedFileIri, grant, {
      fetch: addUserAgent(requestor.fetch, TEST_USER_AGENT),
    })
  );
  await expect(sharedFile.text()).resolves.toBe(fileContent);

  const url = new URL("resources", AMI_URL);
  url.searchParams.append("agent", assertNonNull(requestor.info.webId));

  // Revoke the resource using AMI
  await page.goto(url.toString());
  await page.getByTestId("advanced-login").click();
  await auth.login({ allow: true, timeout: TIMEOUT });
  await page.waitForURL(url.toString());

  await visible(page.getByText(fileName));
  await expect(page.getByTestId(`grant-actions-${fileName}`)).toBeVisible();
  // Click the gear icon to open the popover.
  await page.getByTestId(`grant-actions-${fileName}`).click();
  await expect(page.getByTestId(`grant-popover-${fileName}`)).toBeVisible();

  // Test the popover closes on blur.
  await page.getByTestId("agent-info-box").click();
  await expect(page.getByTestId(`grant-popover-${fileName}`)).not.toBeVisible();

  // Open the sidebar
  await page
    .getByTestId(
      `resource-row-agent[${assertNonNull(
        requestor.info.webId
      )}]-resource[${sharedFileIri}]`
    )
    .click();

  // Access grant was read only - so that should be reflected in the information in the sidebar
  await visible(page.getByTestId("sidebar-access-mode-read"));
  await visible(page.getByTestId("sidebar-access-mode-write"), false);
  await visible(page.getByTestId("sidebar-access-mode-append"), false);

  await page.getByTestId("close-button").click();
  await visible(page.getByTestId("close-button"), false);
  await page.getByTestId(`grant-actions-${fileName}`).click();
  await page.getByTestId(`modal-trigger-revoke-${fileName}`).click();
  await page.getByTestId("modal-ready").isVisible();
  await page.getByTestId("modal-primary-action").click();
  await page.getByTestId("modal-ready").isVisible();
  if (browserName !== "firefox") {
    // The accessibility check closes the modal on firefox.
    await visible(page.getByText(`Access to ${fileName} has been Revoked`));
  }

  await page.getByTestId("modal-primary-action").click();
  await page.getByTestId("modal-ready").isVisible();
  await visible(
    page.getByText(`Access to ${fileName} has been Revoked`),
    false
  );

  // Making sure revocation has occurred.
  const filePromise = retryAsync(() =>
    getFileUsingAccessGrant(sharedFileIri, grant, {
      fetch: addUserAgent(requestor.fetch, TEST_USER_AGENT),
    })
  );

  // After revocation getFile should throw errors
  await expect(filePromise).rejects.toThrow();

  await removeResource(owner, sharedFileIri);
});
