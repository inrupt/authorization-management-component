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

import { useCallback } from "react";
import { useRouter } from "next/router";

export const RETURN_TO_PAGE_KEY = "client:returnTo";

const useReturnUrl = () => {
  const router = useRouter();

  const persist = useCallback(() => {
    if (
      typeof router.query.returnTo === "string" &&
      router.query.returnTo.startsWith("/")
    ) {
      try {
        localStorage.setItem(RETURN_TO_PAGE_KEY, router.query.returnTo);
      } catch {
        // silently fail if persisting the return to URL fails, it sucks but
        // there isn't really a "good" user experience to have here.
      }
    }
  }, [router]);

  const restore = useCallback(() => {
    const returnTo = localStorage.getItem(RETURN_TO_PAGE_KEY);
    localStorage.removeItem(RETURN_TO_PAGE_KEY);

    if (returnTo?.startsWith("/")) {
      return router.replace(returnTo);
    }
    return router.replace("/");
  }, [router]);

  return {
    persist,
    restore,
  };
};

export default useReturnUrl;
