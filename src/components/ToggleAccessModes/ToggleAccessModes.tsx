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

import type { AccessModes } from "@inrupt/solid-client-access-grants";
import { useEffect, useMemo } from "react";
import type { Operations } from "../../helpers/access/access";
import { selectionMatrix } from "../../helpers/access/access";
import Button from "../Button/Button";
import { DisplayAgent } from "../PromiseText/PromiseText";
import Toggle from "../Toggle/Toggle";
import styles from "./ToggleAccessModes.module.scss";

export interface Props {
  // URI of the agent requesting access
  agent: string;
  accessFor: string;
  access: Required<AccessModes>;
  baseModes: Required<AccessModes>;
  onAccessChange: (_access: Required<AccessModes>) => void;
}

export default function ToggleAccessModes({
  access,
  accessFor,
  onAccessChange,
  agent,
  baseModes,
}: Props) {
  const requestedModes = useMemo(
    () =>
      Object.keys(baseModes).filter(
        (key) => baseModes[key as Operations] === true,
      ),
    [baseModes],
  );

  useEffect(() => {
    requestedModes.map((mode) => {
      onAccessChange({
        ...access,
        [mode]: false,
      });
    });
  }, [access, onAccessChange, requestedModes]);

  const allTrue = useMemo(
    () => requestedModes.every((mode) => access[mode as Operations]),
    [requestedModes, access],
  );

  return (
    <div>
      <div className={styles["access-header"]}>
        <div>
          Select{" "}
          <b>
            <DisplayAgent url={agent} />
          </b>
          &apos;s access to {accessFor}
        </div>

        <Button
          variant="small"
          onClick={() => {
            onAccessChange({
              read: !allTrue && baseModes.read,
              write: !allTrue && baseModes.write,
              append: !allTrue && baseModes.append,
            });
          }}
          className={styles["select-all-button"]}
          data-testid="select-all-modes-button"
        >
          {allTrue ? "Deselect" : "Select"} All
        </Button>
      </div>

      <div className={styles["access-container"]}>
        {requestedModes.map((mode) => (
          <div
            key={selectionMatrix[mode as Operations].name}
            className={styles["access-toggle"]}
          >
            <div className={styles["access-label"]}>
              <div className={styles["access-icon"]}>
                <i
                  className={`bi bi-${
                    selectionMatrix[mode as Operations].image
                  } ${styles.alignStart}`}
                  title={selectionMatrix[mode as Operations].name}
                />
              </div>
              <div className={styles["access-icon"]}>
                {selectionMatrix[mode as Operations].name}
              </div>
            </div>
            <div className={styles["toggle-icon"]}>
              <Toggle
                checked={access[mode as Operations]}
                onClick={() =>
                  onAccessChange({
                    ...access,
                    [mode]: !access[mode as Operations],
                  })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
