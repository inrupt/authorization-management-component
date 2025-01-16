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
import { JSX, useContext, useEffect, useMemo, useState } from "react";
import { WorkerContext } from "../../session/WorkerProvider";
import styles from "./PromiseText.module.scss";

/**
 * A basic utility function to render some text with a fallback value
 */
export default function PromiseText({
  promise,
  fallback,
}: {
  promise: Promise<JSX.Element | string | undefined | null> | null;
  fallback: string;
}) {
  const [text, setText] = useState<JSX.Element | string | undefined>(undefined);
  useEffect(() => {
    if (promise) {
      promise
        .then((res) => {
          if (typeof res === "string") {
            setText(res);
          }
        })
        .catch(() => {
          setText(undefined);
        });
    } else {
      setText(undefined);
    }
  }, [promise]);

  return <span>{text ?? fallback}</span>;
}

export function LinkText({
  href,
  text,
}: {
  text: Promise<JSX.Element | string | undefined | null> | null;
  href: string;
}) {
  return (
    <a
      target="blank"
      href={href}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <PromiseText promise={text} fallback={href} />
    </a>
  );
}

export function DisplayAgent({
  url,
  fallback,
}: {
  url: string;
  fallback?: string;
}) {
  const { getNameFromWebId } = useContext(WorkerContext);
  const promise = useMemo(() => getNameFromWebId(url), [url, getNameFromWebId]);
  return <PromiseText fallback={fallback ?? url} promise={promise} />;
}

export function DisplayImage({
  url,
  className,
  fallback,
}: {
  url: string;
  className?: string;
  fallback?: boolean;
}) {
  const { getImageFromWebId, nameRecord } = useContext(WorkerContext);
  const promise = useMemo(
    () => getImageFromWebId(url),
    [url, getImageFromWebId]
  );

  const [text, setText] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (promise) {
      promise
        .then((res) => {
          if (typeof res === "string") {
            setText(res);
          }
        })
        .catch(() => {
          setText(undefined);
        });
    } else {
      setText(undefined);
    }
  }, [promise]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {text ? (
        <img
          alt={`Icon for ${url in nameRecord ? nameRecord[url] : url}`}
          className={className ?? styles.icon}
          src={text}
          title={`Icon for ${url in nameRecord ? nameRecord[url] : url}`}
        />
      ) : (
        fallback && <i className="bi bi-file-earmark-image-fill" />
      )}
    </>
  );
}
