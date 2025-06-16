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

import { useState } from "react";
import styles from "./Modal.module.scss";
import type { Props as ControlledModalProps } from "./ControlledModal";
import ControlledModal from "./ControlledModal";
import Button from "../Button/Button";

interface Props
  extends Omit<
    ControlledModalProps,
    "isOpen" | "onClose" | "onPrimaryAction" | "onSecondaryAction"
  > {
  modalTriggerText: string;
  variant?: string;
  onPrimaryAction?: () => void;
  testIdSuffix?: string;
  onClick?: () => void;
}

export default function Modal({
  modalTriggerText,
  variant = "default",
  testIdSuffix = "",
  onClick,
  ...props
}: Props) {
  const [isOpen, setOpen] = useState(false);
  const onClose = () => setOpen(false);

  return (
    <>
      {modalTriggerText && (
        <Button
          type="button"
          data-testid={`modal-trigger${testIdSuffix ? `-${testIdSuffix}` : ""}`}
          className={`btn btn-primary ${styles["modal-primary-btn"]}`}
          variant={variant}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
            if (onClick !== undefined) {
              onClick();
            }
          }}
        >
          {modalTriggerText}
        </Button>
      )}

      <ControlledModal
        {...props}
        onClose={onClose}
        onPrimaryAction={() => {
          onClose();
          props.onPrimaryAction?.();
        }}
        onSecondaryAction={onClose}
        isOpen={isOpen}
        variant={variant}
      />
    </>
  );
}
