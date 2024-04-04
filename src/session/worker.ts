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
import { PurposeRequest, PurposeResponse } from "./workertypes";
import { PurposeCache, addToCache, defaultUrls } from "./PurposeCache";
// This file is generated in a prepare step, but the shared linter
// uses --ignore-scripts so this file does not exist when we run linting
// in CI.
// eslint-disable-next-line import/no-unresolved
import purposeCacheImport from "../cache/purposesParsed";

const purposeCache: PurposeCache = purposeCacheImport;
const cachedUrls: Record<string, Promise<void> | null> = Object.fromEntries(
  defaultUrls.map((url) => [url, null])
);

function urlReady(url: string) {
  if (!(url in cachedUrls)) {
    cachedUrls[url] = addToCache(url, purposeCache)
      .then(() => {
        cachedUrls[url] = null;
      })
      .catch(() => {
        delete cachedUrls[url];
      });
  }
  return cachedUrls[url];
}

async function getValues(url: string) {
  if (!(url in purposeCache)) {
    await urlReady(url.split("#")[0]);
  }
  return {
    purposeLabel: purposeCache[url]?.purposeLabel,
    definition: purposeCache[url]?.definition,
    url,
  };
}

globalThis.onmessage = async (e: MessageEvent<string>) => {
  const { value, id, type }: PurposeRequest = JSON.parse(e.data);
  globalThis.postMessage(
    JSON.stringify({
      id,
      value: await getValues(value),
      type,
    } as PurposeResponse)
  );
};
