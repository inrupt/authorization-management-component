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

import { useEffect, useCallback, useContext, ReactElement } from "react";
import { useRouter } from "next/router";
import { EVENTS } from "@inrupt/solid-client-authn-core";

import useReturnUrl from "../hooks/useReturnUrl";
import Loader from "../../components/Loader/Loader";
import { SessionContext } from "../../session/SessionProvider";

interface AuthenticationProviderProps {
  children: ReactElement;
}

export default function AuthenticationProvider({
  children,
}: AuthenticationProviderProps): ReactElement {
  const { session, sessionRequestInProgress } = useContext(SessionContext);
  const router = useRouter();
  const { restore } = useReturnUrl();

  const onError = useCallback(
    async (error?: string | null, description?: string | null) => {
      // FIXME: alert error
      console.log(description);

      // FIXME: Remove once interaction_required bug in SDK is resolved:
      // Actually, I'm not sure, maybe we always want this?
      if (error === "interaction_required") {
        return session.logout();
      }
      return router.push("/login");
    },
    [session, router]
  );

  const onSessionRestore = useCallback(
    async (url: string) => {
      await router.push(url);
    },
    [router]
  );

  const onLogout = useCallback(async () => {
    await router.push("/login");
  }, [router]);

  useEffect(() => {
    session.events.on(EVENTS.ERROR, onError);
    session.events.on("login", restore);
    session.events.on("logout", onLogout);
    session.events.on("sessionRestore", onSessionRestore);

    return () => {
      session.events.off(EVENTS.ERROR, onError);
      session.events.off("login", restore);
      session.events.off("logout", onLogout);
      session.events.off("sessionRestore", onSessionRestore);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return sessionRequestInProgress ? <Loader /> : children;
}
