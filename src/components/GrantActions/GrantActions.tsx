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
import { ReactNode, useState } from "react";
import { Popover, PopoverBody } from "reactstrap";
import { v4 } from "uuid";

import styles from "./GrantActions.module.scss";

export default function GrantActions({
  testidSuffix,
  children,
  label,
  flexDirection = "row",
  popoverPlacement = "left",
  actionClicked,
  setActionClicked,
  isSidebar,
}: {
  testidSuffix: string;
  children?: ReactNode;
  label?: string;
  flexDirection?: "row" | "reverse";
  popoverPlacement?: "left" | "bottom" | "right";
  actionClicked: boolean;
  setActionClicked: (c: boolean) => void;
  isSidebar: boolean;
}) {
  const [isSelected, setSelected] = useState<boolean>(false);

  // Enforce multiple instances of the button for the same resource
  // i.e. in resource table and side bar) have different IDs.
  const [idSuffix] = useState<string>(v4());
  const idPrefix = `grant-actions-`;
  return (
    <div
      className={`${styles["actions-container"]} ${
        flexDirection === "row"
          ? styles["actions-container-row"]
          : styles["actions-container-reverse"]
      }`}
    >
      <button
        id={idPrefix + idSuffix}
        data-testid={idPrefix + testidSuffix}
        type="button"
        className={`${
          isSelected && !actionClicked
            ? styles["actions-container-selected"]
            : styles["actions-container-unselected"]
        } ${styles["actions-button"]}`}
        onClick={() => {
          setSelected((toggle) => !toggle || actionClicked);
          // Reset the popover action click when clicking the actions button.
          setActionClicked(false);
        }}
        onBlur={() => {
          // FIXME this should not be required. There appears to be a timing issue
          // on the blur event. In the sidebar case, the blur event closes the popover before
          // the modal comes up, resulting in the modal not being displayed. This behaviour
          // does not happen in the resource list. It also only happens on the first click on
          // the action button in the popover from the sidebar.
          if (!isSidebar) {
            setSelected(false);
          }
        }}
      >
        <i className={`bi bi-gear ${styles["gear-icon"]}`} title="Actions" />
        <span className={styles["actions-label"]}>{label}</span>
      </button>

      <Popover
        isOpen={isSelected}
        onFocus={() => setSelected(true)}
        onBlur={() => setSelected(false)}
        className={actionClicked ? styles.hidden : ""}
        placement={popoverPlacement}
        target={idPrefix + idSuffix}
      >
        <PopoverBody data-testid={`grant-popover-${testidSuffix}`}>
          {children}
        </PopoverBody>
      </Popover>
    </div>
  );
}
