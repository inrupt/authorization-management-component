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

import { render, waitFor } from "@testing-library/react";
import * as axe from "axe-core";
import ModalLoader from "./ModalLoader";

describe("ModalLoader", () => {
  it("renders a full page loader", async () => {
    const { asFragment, container, getByTestId } = render(
      <ModalLoader isOpen />,
    );

    await waitFor(
      () => {
        expect(getByTestId("loading-spinner")).toBeVisible();
      },
      {
        timeout: 2_000,
      },
    );

    expect(asFragment()).toMatchSnapshot();

    // Accessibility tests
    HTMLCanvasElement.prototype.getContext = jest.fn();
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
