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

import { JSX, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Loader from "../../components/Loader/Loader";
import { SessionContext } from "../../session/SessionProvider";

const isAuthCallback = (asPath: string) => {
  try {
    const route = new URL(asPath, window.location.href);
    const params = route.searchParams;

    return params.has("error") || (params.has("code") && params.has("state"));
  } catch (e) {
    return false;
  }
};

interface AuthenticatedRouteProps {
  children: JSX.Element | JSX.Element[];
}

function AuthenticatedRoute({
  children
}: AuthenticatedRouteProps): JSX.Element {
  const { session, sessionRequestInProgress } = useContext(SessionContext);
  const { replace, isReady, asPath } = useRouter();

  useEffect(() => {
    if (
      !session.info.isLoggedIn &&
      !sessionRequestInProgress &&
      isReady &&
      !isAuthCallback(asPath)
    ) {
      // Use useEffect must be of type () => void so we cannot return a promise
      // here.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      replace({
        pathname: "/login",
        query: { returnTo: asPath },
      });
    }
  }, [session, sessionRequestInProgress, replace, isReady, asPath]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return session.info.isLoggedIn ? <>{children}</> : <Loader />;
}

export default AuthenticatedRoute;
