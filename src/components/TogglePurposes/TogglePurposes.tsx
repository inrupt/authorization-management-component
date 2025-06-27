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

import { useContext, useEffect, useState } from "react";
import { WorkerContext } from "../../session/WorkerProvider";
import Info from "../Info/Info";
import styles from "./TogglePurposes.module.scss";

export interface Purpose {
  url: string;
  allowed: boolean;
}

export interface Props {
  purposes: Purpose[];
  togglePurpose: (_purpose: string) => void;
}

const getBaseResult = (url: string) => ({
  purposeLabel: url,
  definition: "Loading ...",
  url,
});

export function DisplayPurpose({ url, info }: { url: string; info: boolean }) {
  const { getPurposeInfo } = useContext(WorkerContext);
  const [{ purposeLabel, definition, url: stateUrl }, setResult] = useState<
    Awaited<ReturnType<typeof getPurposeInfo>>
  >(getBaseResult(url));
  useEffect(() => {
    if (url !== stateUrl) {
      setResult(getBaseResult(url));
    }

    getPurposeInfo(url)
      .then((res) => {
        if (res.url === url) {
          setResult(res);
        }
      })
      .catch(() => {
        /* noop */
      });
    // We don't want to include stateUrl in the dependency array here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, getPurposeInfo]);

  return (
    <>
      {purposeLabel ?? url}
      {info && purposeLabel && (
        <Info>
          <b>{purposeLabel}: </b>
          {definition}
        </Info>
      )}
    </>
  );
}

export default function TogglePurposes({ purposes, togglePurpose }: Props) {
  return (
    <div className={styles["purpose-description"]}>
      Select the purposes you wish to allow:
      <ul>
        {purposes.map((purpose) => (
          <li key={purpose.url}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={purpose.allowed}
              onChange={() => togglePurpose(purpose.url)}
              aria-label="checkbox-toggle"
              aria-labelledby={`toggle-purpose-label-${purpose.url}`}
              data-testid="toggle-purpose"
            />{" "}
            <DisplayPurpose url={purpose.url} info />
          </li>
        ))}
      </ul>
    </div>
  );
}
