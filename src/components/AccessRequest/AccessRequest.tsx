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
  ApproveAccessRequestOverrides,
  getExpirationDate,
  getPurposes,
  getRequestor,
  DatasetWithId,
} from "@inrupt/solid-client-access-grants";
import { useMemo, useState } from "react";
import { getGroupedAccessModes } from "../../helpers/access/access";
import Button from "../Button/Button";
import DatePicker, { DateValue, durationItems } from "../DatePicker/DatePicker";
import ListResources from "../ListResources/ListResourcesBound";
import ControlledModal from "../Modal/ControlledModal";
import Modal from "../Modal/Modal";
import { DisplayAgent } from "../PromiseText/PromiseText";
import ToggleAccessModes from "../ToggleAccessModes/ToggleAccessModes";
import TogglePurposes from "../TogglePurposes/TogglePurposes";
import styles from "./AccessRequest.module.scss";
import getResources from "./utils/getResources";

type Overrides = Partial<
  Pick<ApproveAccessRequestOverrides, "access" | "purpose" | "expirationDate">
>;
type Submit =
  | { action: "approve"; overrides?: Overrides }
  | { action: "deny" }
  | { action: "expire" };

export interface Props {
  accessRequest: DatasetWithId;
  onSubmit: (overrides: Submit) => void;
  onExpired: () => void;
  fetch: typeof fetch;
}

function resourcesToName(names: string[]) {
  if (names.length <= 1) return names[0] || "";

  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export default function AccessRequest({
  accessRequest,
  onSubmit,
  onExpired,
  fetch: authFetch,
}: Props) {
  const data = useMemo(() => {
    const agent = getRequestor(accessRequest);
    const resources = getResources({ accessRequest, fetch: authFetch });
    return {
      expiration: getExpirationDate(accessRequest),
      resources: getResources({ accessRequest, fetch: authFetch }),
      agent,
      accessFor: resourcesToName(resources.map((res) => res.name)),
      baseModes: getGroupedAccessModes([accessRequest]),
    };
  }, [accessRequest, authFetch]);

  const [expirationDate, setExpirationDate] = useState<DateValue>(() =>
    data.expiration
      ? {
          type: "Date",
          value: data.expiration,
        }
      : { type: "Duration", value: "Forever" }
  );
  const [access, onAccessChange] = useState(() =>
    getGroupedAccessModes([accessRequest])
  );
  const [purpose, setPurpose] = useState(() =>
    getPurposes(accessRequest).map((url) => ({ url, allowed: false }))
  );

  const [warnModal, setWarnModal] = useState<
    "purpose" | "access" | "expiry" | false
  >(false);

  const onConfirm = () => {
    // If any of the access modes are changed then override the access field when approving the request
    const accessOverride = (["read", "write", "append"] as const).some(
      (m) => data.baseModes[m] !== access[m]
    )
      ? access
      : undefined;

    // If not all of the listed purposes are approved then we
    // need to submit an override
    const purposeOverride = purpose.every((p) => p.allowed)
      ? undefined
      : purpose.filter((p) => p.allowed).map((p) => p.url);

    const expirationActualValue =
      expirationDate.type === "Duration"
        ? durationItems[expirationDate.value]()
        : expirationDate.value;

    // TODO: Workout difference between undefined and null in terms of infinite access grants
    const expirationOverride =
      expirationActualValue?.valueOf() !== data.expiration?.valueOf()
        ? expirationActualValue
        : undefined;

    if (purposeOverride?.length === 0) {
      setWarnModal("purpose");
    } else if (Object.values(access).every((value) => value === false)) {
      setWarnModal("access");
    } else if (
      expirationOverride
        ? expirationOverride.valueOf() < Date.now()
        : data.expiration && data.expiration.valueOf() < Date.now()
    ) {
      setWarnModal("expiry");
    } else {
      onSubmit({
        action: "approve",
        overrides:
          accessOverride || purposeOverride || expirationOverride
            ? {
                access: accessOverride,
                purpose: purposeOverride,
                expirationDate: expirationOverride,
              }
            : undefined,
      });
    }
  };

  const onDeny = () => onSubmit({ action: "deny" });

  const togglePurpose = (url: string) => {
    setPurpose(
      purpose.map((elem) =>
        elem.url === url
          ? {
              ...elem,
              allowed: !elem.allowed,
            }
          : elem
      )
    );
  };

  return (
    <div
      className={styles["access-container"]}
      data-testid="access-request-container"
    >
      {warnModal && (
        <ControlledModal
          onClose={() => {
            if (warnModal === "expiry") {
              onExpired();
            } else {
              setWarnModal(false);
            }
          }}
          title={
            {
              purpose: "Select a purpose",
              access: "You haven't selected any access",
              expiry: "Invalid Expiration Date",
            }[warnModal]
          }
          onPrimaryAction={() => {
            if (warnModal === "expiry") {
              onExpired();
            } else {
              setWarnModal(false);
            }
          }}
          isOpen
          variant="warn"
          primaryActionText={
            {
              purpose: "Go Back",
              access: "Go Back",
              expiry: "Back to Application",
            }[warnModal]
          }
        >
          {
            {
              purpose: (
                <>
                  At least one purpose needs to be selected to approve access
                  for <DisplayAgent url={data.agent} />
                </>
              ),
              access: (
                <>
                  <DisplayAgent url={data.agent} /> will not have access to
                  anything on your Pod
                </>
              ),
              expiry: <>The expiry date for the requested access has passed</>,
            }[warnModal]
          }
          .
        </ControlledModal>
      )}
      <h1 className={styles.header} data-testid="access-request-title">
        <b>
          Allow <DisplayAgent url={data.agent} /> access to {data.accessFor}?
        </b>
      </h1>
      <div className={styles["access-description"]}>
        <b>
          <DisplayAgent url={data.agent} />
        </b>{" "}
        is requesting access to
      </div>
      <ListResources resources={data.resources} />

      {purpose.length > 0 ? (
        <TogglePurposes purposes={purpose} togglePurpose={togglePurpose} />
      ) : (
        <br />
      )}

      <div className={styles["access-details"]}>
        <b>
          <DisplayAgent url={data.agent} />
        </b>{" "}
        will have access for
      </div>
      <DatePicker
        expirationDate={expirationDate}
        setExpirationDate={setExpirationDate}
        requestedExpirationDate={data.expiration}
      />

      <div className={styles["access-details"]}>
        <ToggleAccessModes
          baseModes={data.baseModes}
          agent={data.agent}
          access={access}
          accessFor={data.accessFor}
          onAccessChange={onAccessChange}
        />
      </div>

      <div className={styles.buttons}>
        <div className={styles["deny-button"]}>
          <Modal
            variant="outline"
            primaryActionText="Deny All Access"
            secondaryActionText="Cancel"
            title="Deny All Access?"
            modalTriggerText="Deny All Access"
            onPrimaryAction={onDeny}
          >
            <DisplayAgent url={data.agent} /> will not have any access to this
            resource.
          </Modal>
        </div>
        <Button onClick={onConfirm} data-testid="confirm-access">
          Confirm Access
        </Button>
      </div>
    </div>
  );
}
