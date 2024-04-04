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

import { render, waitFor } from "@testing-library/react";
import * as axe from "axe-core";
import Modal from "./ControlledModal";

describe("Modal", () => {
  it.each(["danger", "default", "primary"])(
    "renders an %s Modal",
    async (variant) => {
      const { baseElement, getByText } = render(
        <Modal
          title="Deny All Access?"
          isOpen
          onClose={() => {
            /* noop */
          }}
          variant={variant}
          isDanger={variant === "danger"}
        >
          Agent X will not have access to this resource.
        </Modal>
      );

      await waitFor(() => {
        return expect(getByText("Deny All Access?")).toBeVisible();
      });

      // Accessibility tests
      HTMLCanvasElement.prototype.getContext = jest.fn();
      const results = await axe.run(baseElement);
      expect(results.violations).toHaveLength(0);

      expect(baseElement).toMatchSnapshot();
    }
  );
});
