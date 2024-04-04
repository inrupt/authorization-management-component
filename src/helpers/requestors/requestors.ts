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
  getRequestor,
  isValidAccessGrant,
  DatasetWithId,
} from "@inrupt/solid-client-access-grants";
import { VerifiableCredentialApiConfiguration } from "@inrupt/solid-client-vc";
import getValidAccessGrants from "../access/getValidAccessGrants";

export default async function getRequestors(options: {
  fetch: typeof fetch;
  webId: string;
  accessEndpoint: string;
  endpointConfiguration: VerifiableCredentialApiConfiguration;
  isValidAccessGrant: (
    ..._args: Parameters<typeof isValidAccessGrant>
  ) => Promise<boolean>;
}) {
  return new Set(
    (
      await getValidAccessGrants(
        options.isValidAccessGrant,
        {},
        {
          fetch: options.fetch,
          includeExpired: false,
          accessEndpoint: options.accessEndpoint,
          endpointConfiguration: options.endpointConfiguration,
        }
      )
    )
      .map((a: DatasetWithId) => {
        try {
          return getRequestor(a);
        } catch (e: unknown) {
          // If the Access Grant requestor cannot be figured out,
          // the Grant cannot be considered in computing access.
          return undefined;
        }
      })
      .filter((value): value is string => value !== undefined)
  );
}
