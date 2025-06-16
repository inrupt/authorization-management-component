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

import type { ReactElement } from "react";
import { useMemo } from "react";

import type { Session } from "@inrupt/solid-client-authn-browser";
import type { ISessionContext, ISessionProvider } from "./SessionProvider";
import { SessionContext, createContextBase } from "./SessionProvider";
import derive from "./mockData/derive";

export const sessionFetch: typeof fetch = async (...args) => {
  switch (args[0]) {
    case "http://example.org/derive": {
      const str = args[1]?.body?.toString();

      if (!str) {
        return new Response("Bad", { status: 500 });
      }

      const subject =
        JSON.parse(str).verifiableCredential.credentialSubject.providedConsent
          .isProvidedTo;

      return new Response(
        JSON.stringify({
          ...derive,
          verifiableCredential: subject
            ? derive.verifiableCredential.filter(
                (vc) =>
                  vc.credentialSubject.providedConsent.isProvidedTo === subject,
              )
            : derive.verifiableCredential,
        }),
        {
          headers: new Headers([["Content-Type", "application/json"]]),
        },
      );
    }
    case "https://vc.ap.inrupt.com/status": {
      const str = args[1]?.body?.toString();

      if (!str) {
        return new Response("Bad", { status: 500 });
      }

      const { credentialId } = JSON.parse(str);

      // Mock the revocation of the VCs by just removing them for now (note that this is completely incorrect
      // as they would still appear in reailty and just return false when trying to verify them)
      derive.verifiableCredential = derive.verifiableCredential.filter(
        (vc) => vc.id !== credentialId,
      );
      return new Response(JSON.stringify(derive), {
        headers: new Headers([["Content-Type", "application/json"]]),
      });
    }
    default:
      throw new Error(`fetch called [${args[0]}]`);
  }
};

/**
 * Used to provide session data to child components through context.
 */
export default function SessionProvider({
  children,
  mockLoggedIn = true,
  mockAccessEndpoint,
}: ISessionProvider & {
  mockLoggedIn?: boolean;
  mockAccessEndpoint?: string;
}): ReactElement {
  const value = useMemo((): ISessionContext => {
    const context: ISessionContext = {
      ...createContextBase(),
      fetch: sessionFetch,
      accessEndpoint: mockAccessEndpoint,
      endpointConfiguration: {
        specCompliant: {},
        legacy: {},
      },
      sessionRequestInProgress: false,
      state: "authenticated",
      session: {
        fetch: sessionFetch,
        info: {
          isLoggedIn: mockLoggedIn,
          sessionId: mockLoggedIn ? "0000-0000-0000-0000" : undefined,
          webId: mockLoggedIn ? "http://example.org/webId" : undefined,
        },
        on: () => context.session,
        off: () => context.session,
      } as Partial<Session> as Session,
    };
    return context;
  }, []);
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
