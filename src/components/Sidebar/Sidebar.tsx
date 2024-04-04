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

import { AccessGrant } from "@inrupt/solid-client-access-grants";
import type { DatasetWithId } from "@inrupt/solid-client-vc";
import { useMemo, useState } from "react";
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap";
import {
  Operations,
  getAccessStringFromAccessMode,
  getGroupedAccessModes,
  getGroupedPurposes,
  getIconClassNameForAccessMode,
  getLatestExpirationDate,
} from "../../helpers/access/access";
import {
  getFileNameFromIri,
  getPathComponentsFromIri,
} from "../../helpers/resource/resource";
import FileIcon from "../FileIcon/FileIcon";
import { DisplayAgent } from "../PromiseText/PromiseText";
import RevokeButton from "../RevokeButton/RevokeButton";
import { DisplayPurpose } from "../TogglePurposes/TogglePurposes";
import styles from "./Sidebar.module.scss";
import GrantActions from "../GrantActions/GrantActions";

export default function Sidebar({
  resourceIri,
  requestor,
  grants,
  isOpen,
  onClose,
  onRefresh,
}: {
  resourceIri: string;
  requestor: string;
  grants: Array<DatasetWithId>;
  onClose: () => void;
  isOpen: boolean;
  onRefresh: () => void;
}) {
  const [actionClicked, setActionClicked] = useState<boolean>(false);
  const { filename, pathComponents, expiryDate, accessModes, purposes } =
    useMemo(() => {
      return {
        filename: getFileNameFromIri(resourceIri),
        pathComponents: getPathComponentsFromIri(resourceIri),
        expiryDate: getLatestExpirationDate(grants),
        accessModes: getGroupedAccessModes(grants),
        purposes: getGroupedPurposes(grants as AccessGrant[]),
      };
    }, [grants, resourceIri]);

  return (
    <Offcanvas
      direction="end"
      isOpen={isOpen}
      toggle={onClose}
      className={`${styles.sidebar}`}
      aria-label="Resource Access Details"
    >
      <OffcanvasHeader tag="h3">
        <button
          type="button"
          className={`btn-close text-reset ${styles["sidebar-close-button"]}`}
          onClick={onClose}
          data-testid="close-button"
        >
          <span className="visually-hidden">Close Sidebar</span>
        </button>
        <div className={styles["sidebar-subheader"]}>
          <h1 className={styles["sidebar-filename"]}>
            <FileIcon resourceIri={resourceIri} />
            {filename}
          </h1>
          <p className={styles["sidebar-title"]}>
            {pathComponents.map((c, i) => {
              if (i === 0) return "My Pod > ";
              if (i < pathComponents.length - 1) {
                return `${c} > `;
              }
              return c;
            })}
          </p>

          <GrantActions
            testidSuffix={filename}
            label="Actions"
            flexDirection="reverse"
            popoverPlacement="bottom"
            actionClicked={actionClicked}
            setActionClicked={setActionClicked}
            isSidebar
          >
            <RevokeButton
              agent={requestor}
              name={pathComponents[pathComponents.length - 1]}
              grants={grants}
              onRevoke={() => {
                onRefresh();
              }}
              onClick={() => {
                setActionClicked(true);
              }}
              variant="outline-clear"
            />
          </GrantActions>
        </div>
      </OffcanvasHeader>
      <OffcanvasBody tabIndex={0} className={styles.sidebar}>
        <h2>
          <b>
            Access given to <DisplayAgent url={requestor} />
          </b>
        </h2>
        <ul className={styles["access-list"]}>
          {Object.entries(accessModes).map(([key, value]) => {
            return (
              value && (
                <li key={key} data-testid={`sidebar-access-mode-${key}`}>
                  <i
                    className={getIconClassNameForAccessMode(key as Operations)}
                  />
                  {getAccessStringFromAccessMode(key as Operations)}
                </li>
              )
            );
          })}
        </ul>
        <hr />
        <h2>
          <b>Expiry Date</b>
        </h2>
        <p className={styles["expiry-date"]}>
          {expiryDate ? new Date(expiryDate).toDateString() : "Forever"}
        </p>
        <hr />
        <h2>
          <b>{purposes.length > 1 ? "Purposes" : "Purpose"}</b>
        </h2>
        <ul>
          {purposes.map((p) => {
            return (
              <li key={p}>
                <DisplayPurpose url={p} info={false} />
              </li>
            );
          })}
        </ul>
      </OffcanvasBody>
    </Offcanvas>
  );
}
