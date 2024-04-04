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
  AccessBaseOptions,
  AccessGrantAny,
  isValidAccessGrant as _isValidAccessGrant,
  getAccessGrantAll,
  DatasetWithId,
} from "@inrupt/solid-client-access-grants";
import { VerifiableCredentialApiConfiguration } from "@inrupt/solid-client-vc";

export default async function getValidAccessGrants(
  isValidAccessGrant: (
    ..._args: Parameters<typeof _isValidAccessGrant>
  ) => Promise<boolean>,
  accessParameters: Parameters<typeof getAccessGrantAll>[0],
  queryOptions: AccessBaseOptions & {
    includeExpired?: boolean;
    endpointConfiguration: VerifiableCredentialApiConfiguration;
  }
): Promise<DatasetWithId[]> {
  if (queryOptions.accessEndpoint === undefined) {
    throw new Error("The access endpoint must be provided for valdiation.");
  }

  const verificationEndpoint =
    queryOptions.endpointConfiguration.verifierService;
  if (typeof verificationEndpoint !== "string") {
    throw new Error(
      "The verification endpoint must be provided for valdiation."
    );
  }
  // Note that `getAccessGrantAll` hard codes the derivation endpoint,
  // hence it being passed the base accessendpoint.
  const grants = await getAccessGrantAll(accessParameters, {
    ...queryOptions,
    returnLegacyJsonld: false,
  });
  let verifiedCount = 0;
  const CONCURRENT_VERIFICATIONS = 20;
  const verifiedGrants: AccessGrantAny[] = [];
  console.log("Starting validation");
  while (verifiedCount < grants.length) {
    console.log(
      `Verifying chunk ${verifiedCount} to ${Math.min(
        verifiedCount + CONCURRENT_VERIFICATIONS,
        grants.length
      )}`
    );
    // We intentionally await in a loop to chunk verification requests.
    // eslint-disable-next-line no-await-in-loop
    const verifications = await Promise.all(
      grants
        .slice(
          verifiedCount,
          Math.min(verifiedCount + CONCURRENT_VERIFICATIONS, grants.length)
        )
        .map(async (grant) => {
          // Note: this function involves a network call to the /verify endpoint
          const validity = await isValidAccessGrant(grant, {
            verificationEndpoint,
          });
          return validity && grant;
        })
    );
    verifiedCount += CONCURRENT_VERIFICATIONS;
    verifiedGrants.push(
      ...verifications.filter(
        (grant): grant is AccessGrantAny => grant !== false
      )
    );
  }
  console.log("Validation done");
  return verifiedGrants;
}
