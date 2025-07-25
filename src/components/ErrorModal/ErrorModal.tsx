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

import Modal from "../Modal/ControlledModal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errString = (err: any) =>
  "message" in err ? `${err.message}` : `${err}`;

function ErrorModalBody({ error }: { error: Error }) {
  if (error.cause === undefined || error.cause === null) {
    return <p>{error.message}</p>;
  }
  return (
    <details>
      <summary>{error.message}</summary>
      {error.cause.toString()}
    </details>
  );
}

export function ErrorModal({
  isOpen,
  err,
  onReload,
  onClose,
}: {
  isOpen: boolean;
  err: Error;
  onReload?: () => void;
  onClose: () => void;
}) {
  // Temporary fix, the approve page should be refactored instead.
  if (err === null) {
    return <></>;
  }
  return (
    <Modal
      title={err.name}
      variant="confirmation"
      primaryActionText="Ok"
      confirmationImage="bi bi-exclamation-triangle-fill"
      onPrimaryAction={onReload}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ErrorModalBody error={err} />
    </Modal>
  );
}
