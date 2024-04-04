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
import Modal from "../Modal/ControlledModal";
import AMC_CURRENT_OP from "../../constants/currentOP";
import { mapping } from "../../constants/OPStartServiceMapping";
import { useEffect, useState } from "react";

export function ProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const currentOP = localStorage.getItem(AMC_CURRENT_OP);
  const startService = currentOP ? mapping[currentOP] : undefined;

  const onPrimaryAction = () => {
    location.href = `${startService}`;
  };

  return startService ? (
    <Modal
      title="Problem looking up your WebID"
      variant="confirmation"
      primaryActionText="Take me there"
      confirmationImage="bi bi-exclamation-triangle-fill"
      onPrimaryAction={onPrimaryAction}
      isOpen={isOpen}
      onClose={onClose}
    >
      {
        <p>
          There's a problem with your WebID availability. Please go to{" "}
          <a href={`${startService}`}>your ESS provider start service</a> and
          finish the start flow.
        </p>
      }
    </Modal>
  ) : (
    <Modal
      title="Problem connecting to your Pod"
      variant="confirmation"
      confirmationImage="bi bi-exclamation-triangle-fill"
      primaryActionText="OK"
      onPrimaryAction={onClose}
      isOpen={isOpen}
      onClose={onClose}
    >
      <p>
        AMC could not access your WebID. Please contact your WebID provider and
        make sure your WebID Document is publicly available.
      </p>
    </Modal>
  );
}
