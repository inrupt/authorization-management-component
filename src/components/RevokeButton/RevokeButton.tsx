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
  revokeAccessGrant,
  DatasetWithId,
} from "@inrupt/solid-client-access-grants";
import { useCallback, useContext, useMemo, useState } from "react";
import { getGroupedResources } from "../../helpers/access/access";
import { SessionContext } from "../../session/SessionProvider";
import { resourceDetails } from "../AccessRequest/utils/getResources";
import ListResources from "../ListResources/ListResources";
import ModalLoader from "../Loader/ModalLoader";
import ControlledModal from "../Modal/ControlledModal";
import Modal from "../Modal/Modal";
import { DisplayAgent } from "../PromiseText/PromiseText";

type RevocationStatus = "revoked" | "revoking" | "error";

export default function RevokeButton({
  name,
  agent,
  grants,
  onRevoke,
  onClick,
  variant = "outline-clear",
}: {
  // If this variable is defined then we are revoking a single resource
  // if this variable is *not* defined then we are revoking access to
  // all resources.
  name?: string;
  agent: string;
  grants: DatasetWithId[];
  onRevoke: () => void;
  variant?: "danger" | "outline" | "outline-clear";
  onClick?: () => void;
}) {
  const { fetch } = useContext(SessionContext);
  const [state, setState] = useState<RevocationStatus>();
  const resources = useMemo(
    () => resourceDetails({ resources: getGroupedResources(grants), fetch }),
    [grants, fetch]
  );

  const revoke = useCallback(async () => {
    setState("revoking");
    try {
      await Promise.all(
        grants.map((grant) => revokeAccessGrant(grant, { fetch }))
      );
      setState("revoked");
    } catch (e) {
      setState("error");
    }
  }, [grants, fetch]);

  return (
    <>
      <Modal
        title={
          name
            ? `Revoke all access to ${name}?`
            : "Revoke access to all resources?"
        }
        variant={variant}
        primaryActionText="Revoke All Access"
        secondaryActionText="Cancel"
        modalTriggerText={
          name ? "Revoke Access" : "Revoke Access to All Resources"
        }
        onPrimaryAction={revoke}
        testIdSuffix={`revoke-${name}`}
        onClick={onClick}
        isDanger
      >
        <DisplayAgent url={agent} /> will no longer have access to{" "}
        {name
          ? name +
            (resources.length > 1 ? " or any of the following resources" : "")
          : "any resources"}{" "}
        if you deny access.
        {name && resources.length > 1 && (
          <>
            {resources.map((resource) => (
              <ListResources {...resource} key={resource.key} />
            ))}
          </>
        )}
      </Modal>

      <ModalLoader isOpen={state === "revoking"} />

      <ControlledModal
        variant="confirmation"
        isOpen={state === "revoked"}
        confirmationImage="bi bi-slash-circle-fill"
        onClose={() => {
          setState(undefined);
          onRevoke();
        }}
        title=""
        primaryActionText="OK"
      >
        {name ? "All" : ""} Access to {name ?? "all resources"} has been Revoked
        for <DisplayAgent url={agent} />.
      </ControlledModal>

      <ControlledModal
        variant="confirmation"
        isOpen={state === "error"}
        onClose={() => {
          setState(undefined);
        }}
        title="Revocation Failed"
        primaryActionText="OK"
        confirmationImage="bi bi-exclamation-triangle-fill"
      >
        Failed to revoke <DisplayAgent url={agent} /> access to{" "}
        {name ?? "all resources"}.
      </ControlledModal>
    </>
  );
}

RevokeButton.defaultProps = {
  name: undefined,
  variant: "danger",
  onClick: undefined,
};
