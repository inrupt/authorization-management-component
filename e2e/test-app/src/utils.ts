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
import { Session } from "@inrupt/solid-client-authn-node";

export async function retryAsync<T>(
  callback: () => Promise<T>,
  maxRetries = 5,
  interval = 5_000
): Promise<T> {
  let tries = 0;
  const errors: Error[] = [];
  while (tries < maxRetries) {
    try {
      // The purpose here is to retry an async operation, not to parallelize.
      // Awaiting the callback will throw on error before returning.
      // eslint-disable-next-line no-await-in-loop
      return await callback();
    } catch (e: unknown) {
      errors.push(e as Error);
      tries += 1;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, interval);
      });
    }
  }
  const errorsString = errors.map((e) => e.toString()).join("\n");
  throw new Error(
    `An async callback is still failing after ${maxRetries} retries. The errors were: ${errorsString}`,
    { cause: errors.slice(-1)[0] }
  );
}

export async function createLoggedInSession(params: {
  id?: string;
  secret?: string;
  idp?: string;
}) {
  return retryAsync(async () => {
    const session = new Session();
    await session.login({
      oidcIssuer: params.idp,
      clientId: params.id,
      clientSecret: params.secret,
      // Note that currently, using a Bearer token (as opposed to a DPoP one)
      // is required for the UMA access token to be usable.
      tokenType: "Bearer",
    });
    return session;
  });
}

export type ApiError = {
  type: string;
  title: string;
  status: number;
  detail: string;
};
