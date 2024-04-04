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
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { v4 } from "uuid";
import { isValidAccessGrant as _isValidAccessGrant } from "@inrupt/solid-client-access-grants";
import {
  getResourceInfo,
  getContentType as solidClientGetContentType,
} from "@inrupt/solid-client";
import { PurposeInfo, PurposeRequest, PurposeResponse } from "./workertypes";
import { SessionContext } from "./SessionProvider";
import {
  getFromWebIdHelper,
  namePredicates,
  imagePredicates,
} from "../helpers/profile/profile";

export interface IWorkerContext {
  getPurposeInfo: (_url: string) => Promise<PurposeInfo>;
  getNameFromWebId: (_url: string) => Promise<string | null>;
  getImageFromWebId: (_url: string) => Promise<string | null>;
  getContentType: (_url: string) => Promise<string | null>;
  isValidAccessGrant: (
    ..._args: Parameters<typeof _isValidAccessGrant>
  ) => Promise<boolean>;
  nameRecord: Record<string, string>;
}

export const WorkerContext = createContext<IWorkerContext>({
  getPurposeInfo: () =>
    new Promise<PurposeInfo>(() => {
      /* promise never resolves */
    }),
  getNameFromWebId: () =>
    new Promise<string | null>(() => {
      /* promise never resolves */
    }),
  getImageFromWebId: () =>
    new Promise<string | null>(() => {
      /* promise never resolves */
    }),
  getContentType: () =>
    new Promise<string | null>(() => {
      /* promise never resolves */
    }),
  isValidAccessGrant: async (vc, options) => {
    const valid = await _isValidAccessGrant(vc, options);
    return valid.errors.length === 0;
  },
  nameRecord: {},
});

/* eslint react/require-default-props: 0 */
export interface IWorkerProvider {
  children: ReactNode;
}

/**
 * Used to provide session data to child components through context.
 */
export default function WorkerProvider({
  children,
}: IWorkerProvider): ReactElement {
  const { fetch } = useContext(SessionContext);
  const [worker, setWorker] = useState<Worker>();
  const nameRecord = useMemo<Record<string, Promise<string | null>>>(
    () => ({}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetch]
  );
  const imageRecord = useMemo<Record<string, Promise<string | null>>>(
    () => ({}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetch]
  );
  const purposeRecord = useMemo<Record<string, PurposeInfo>>(() => ({}), []);
  const invalidatedUrl = useMemo<Set<string>>(() => new Set(), []);
  const [resolvedNameRecord, setResolvedNameRecord] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    setWorker(new Worker(new URL("./worker.ts", import.meta.url)));
  }, []);

  const getImageFromWebId = useCallback(
    // eslint-disable-next-line no-return-assign
    async (url: string) =>
      (imageRecord[url] ??= getFromWebIdHelper(url, imagePredicates, {
        fetch,
        allowedNamed: true,
      })),
    [fetch, imageRecord]
  );

  const getNameFromWebId = useCallback(
    // eslint-disable-next-line no-return-assign
    async (url: string) =>
      (nameRecord[url] ??= getFromWebIdHelper(url, namePredicates, {
        fetch,
      })).then((name) => {
        if (name && !(name in resolvedNameRecord)) {
          setResolvedNameRecord({ ...resolvedNameRecord, [url]: name });
        }
        return name;
      }),
    // We don't want to make resolvedNameRecord a dependency of the callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetch, nameRecord]
  );

  const getContentType = useMemo(() => {
    const cache: Record<string, Promise<string | null>> = {};
    return async (resourceIri: string) => {
      if (!(resourceIri in cache)) {
        cache[resourceIri] = getResourceInfo(resourceIri, {
          fetch,
        })
          .then((c) => solidClientGetContentType(c))
          .catch(() => {
            delete cache[resourceIri];
            return null;
          });
      }
      return cache[resourceIri];
    };
  }, [fetch]);

  const isValidAccessGrant = useCallback(
    async (...args: Parameters<typeof _isValidAccessGrant>) => {
      let [vcUrl] = args;

      if (
        typeof vcUrl === "object" &&
        !(vcUrl instanceof URL) &&
        "id" in vcUrl
      ) {
        vcUrl = vcUrl.id;
      }

      if (invalidatedUrl.has(vcUrl.toString())) {
        return false;
      }

      const result = await _isValidAccessGrant(...args);
      if (result.errors.length !== 0) {
        invalidatedUrl.add(vcUrl.toString());
        return false;
      }
      return true;
    },
    // We don't want to make resolvedNameRecord a dependency of the callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getPurposeInfo = useCallback(
    async (url: string) => {
      if (url in purposeRecord) {
        return purposeRecord[url];
      }

      return new Promise<PurposeInfo>((res) => {
        const fixedWorker = worker;
        const id = v4();

        const listener = ({ data }: MessageEvent) => {
          const result: PurposeResponse = JSON.parse(data);
          if (result.id === id) {
            fixedWorker?.removeEventListener("message", listener);
            purposeRecord[url] = result.value;
            res(result.value);
          }
        };
        fixedWorker?.addEventListener("message", listener);
        fixedWorker?.postMessage(
          JSON.stringify({
            type: "purpose",
            value: url,
            id,
          } as PurposeRequest)
        );
      });
    },
    [worker, purposeRecord]
  );

  const value = useMemo(
    () => ({
      getPurposeInfo,
      getNameFromWebId,
      getImageFromWebId,
      isValidAccessGrant,
      nameRecord: resolvedNameRecord,
      getContentType,
    }),
    [
      getPurposeInfo,
      getNameFromWebId,
      getImageFromWebId,
      resolvedNameRecord,
      isValidAccessGrant,
      getContentType,
    ]
  );

  return (
    <WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>
  );
}
