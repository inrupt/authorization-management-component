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

import { useState, type ReactNode } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import styles from "./Modal.module.scss";
import Button from "../Button/Button";

export interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPrimaryAction?: () => void;
  primaryActionText?: string;
  title: string;
  confirmationImage?: string;
  onSecondaryAction?: () => void;
  secondaryActionText?: string;
  children?: ReactNode;
  variant?: string;
  isDanger?: boolean;
}

export default function ControlledModal({
  isOpen,
  onClose,
  confirmationImage,
  onPrimaryAction,
  primaryActionText,
  onSecondaryAction,
  secondaryActionText,
  title,
  children,
  variant,
  isDanger,
}: Props) {
  const [transitionedIn, setTransitionedIn] = useState<boolean>(false);
  const [transitioningOut, setTransitioningOut] = useState<boolean>(false);
  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      labelledBy="modalLabel"
      className={
        variant === "confirmation" ? styles["confirmation-modal"] : undefined
      }
      data-testid={
        transitionedIn && !transitioningOut ? "modal-ready" : undefined
      }
      onEnter={() => setTransitionedIn(false)}
      onOpened={() => setTransitionedIn(true)}
      onExit={() => setTransitioningOut(true)}
      onClosed={() => setTransitioningOut(false)}
    >
      <ModalHeader
        className={
          variant == "warn"
            ? styles["warn-modal-header"]
            : styles["modal-header"]
        }
      >
        <div>
          {confirmationImage && (
            <i className={confirmationImage} title="Confirm" />
          )}
          <h4 className="modal-title" id="modalLabel">
            {title}
          </h4>
        </div>
      </ModalHeader>
      <ModalBody
        className={
          variant == "warn"
            ? styles["warn-modal-content"]
            : styles["modal-content"]
        }
      >
        {children}
      </ModalBody>
      <ModalFooter
        className={
          variant == "warn"
            ? styles["warn-modal-footer"]
            : styles["modal-footer"]
        }
      >
        {secondaryActionText && (
          <Button
            type="button"
            variant="outline"
            className={`btn btn-secondary ${styles["modal-secondary-btn"]}`}
            onClick={onSecondaryAction}
          >
            {secondaryActionText}
          </Button>
        )}
        <Button
          type="button"
          variant={isDanger ? "danger" : "primary"}
          data-testid="modal-primary-action"
          className={`btn btn-primary ${styles["modal-primary-btn"]}`}
          onClick={onPrimaryAction ?? onClose}
        >
          {primaryActionText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

ControlledModal.defaultProps = {
  variant: "default",
  primaryActionText: "Save",
  onPrimaryAction: undefined,
  confirmationImage: undefined,
  onSecondaryAction: undefined,
  secondaryActionText: undefined,
  children: undefined,
};
