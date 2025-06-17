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

import { act, render } from "@testing-library/react";
import * as axe from "axe-core";
import ListResources from "./ListResources";
import SessionProvider from "../../session/SessionProvider.mock";

describe("ListResources", () => {
  it("renders a ListResources component", async () => {
    const { asFragment, container } = render(
      <SessionProvider mockAccessEndpoint="https://example.org">
        <ListResources
          key="https://example.org/"
          resourceIri="https://example.org/"
          type="Container"
          name="Test Container"
          contains={async () => [
            {
              type: "Container",
              name: "Test Sub Container",
              contains: async () => [
                {
                  type: "Container",
                  name: "Test Nested Sub Container",
                  contains: async () => [],
                  key: "https://example.org/key3",
                  resourceIri: "https://example.org/key3",
                },
              ],
              key: "https://example.org/key",
              resourceIri: "https://example.org/key",
            },
            {
              type: "Resource",
              name: "Test Sub Resource",
              contains: async () => [],
              key: "https://example.org/key2",
              resourceIri: "https://example.org/key2",
            },
          ]}
        />
      </SessionProvider>,
    );
    await act(async () => {
      /* noop */
    });
    expect(asFragment()).toMatchSnapshot();

    // Accessibility tests
    HTMLCanvasElement.prototype.getContext = jest.fn();
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
