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
import { GRANT_VC_URL_PARAM_NAME } from "@inrupt/solid-client-access-grants";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";

function toString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default function useQueryParams() {
  const { query, replace, pathname } = useRouter();

  const [{ agent, redirectUrl, accessGrantUrl }, setData] = useState<{
    agent?: string;
    redirectUrl?: string;
    accessGrantUrl?: string;
  }>({});
  const { length } = Object.keys(query);

  useEffect(() => {
    if (length > 0) {
      setData({
        agent: toString(query.agent),
        redirectUrl: toString(query.redirectUrl),
        accessGrantUrl: toString(query[GRANT_VC_URL_PARAM_NAME]),
      });
      // Use useEffect must be of type () => void so we cannot return a promise
      // here.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      replace({
        pathname,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  const redirect = useCallback(async () => {
    if (typeof redirectUrl === "string" && redirectUrl !== "") {
      await replace({
        pathname: redirectUrl,
        query: {
          [GRANT_VC_URL_PARAM_NAME]: accessGrantUrl,
        },
      });
    }
  }, [redirectUrl, replace, accessGrantUrl]);

  return { agent, redirect, redirectUrl };
}
