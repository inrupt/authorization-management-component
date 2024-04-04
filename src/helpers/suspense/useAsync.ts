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
import { useCallback, useMemo, useState } from "react";
import wrapPromise, { PromiseResult } from "./wrapPromise";

export default function useAsync<T extends ReadonlyArray<unknown>, V>(
  cb: (..._args: T) => Promise<V>,
  args: T
): { read: () => PromiseResult<V>; forceReload: () => void } {
  const [reload, setReload] = useState(Symbol);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const read = useMemo(() => wrapPromise(cb(...args)), [...args, reload, cb]);
  const forceReload = useCallback(() => {
    setReload(Symbol("placeholder"));
  }, []);
  return {
    read,
    forceReload,
  };
}
