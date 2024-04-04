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
import { ResourceDetailsWithProvenance } from "../../components/ResourceList/ResourceList";

export default [
  {
    type: "Resource",
    key: "http://example.org/Test Resource with much longer name",
    resourceIri: "http://example.org/Test Resource with much longer name",
    name: "Test Resource with much longer name",
    access: { read: true, write: false, append: false },
    expiry: new Date(1689301199866),
    contains: async () => [],
    grants: [],
  },
  {
    type: "Container",
    name: "Test Container",
    key: "http://example.org/Test Container",
    access: { read: true, write: true, append: true },
    expiry: new Date(1689301199866 + 86400000 * 5),
    contains: async () => [
      {
        type: "Container",
        name: "Test Sub Container",
        key: "http://example.org/Test Container/Test Sub Container",
        contains: async () =>
          new Promise((res) => {
            setTimeout(
              () =>
                res([
                  {
                    type: "Container",
                    name: "Test Nested Sub Container",
                    key: "http://example.org/Test Container/Test Sub Container/Test Nested Sub Container",
                    resourceIri:
                      "http://example.org/Test Container/Test Sub Container/Test Nested Sub Container",
                    contains: async () =>
                      new Promise(() => {
                        /* noop */
                      }),
                  },
                ]),
              3_000
            );
          }),
        grants: [],
      },
      {
        type: "Resource",
        name: "Test Sub Resource",
        key: "http://example.org/Test Container/Test Sub Resource",
        contains: async () => [],
        grants: [],
      },
    ],
  },
  {
    type: "Resource",
    name: "Test Resource with much much longer name",
    key: "http://example.org/Test Resource with much much longer name",
    access: { read: false, write: false, append: false },
    expiry: new Date(1689301199866),
    contains: async () => [],
    grants: [],
  },
] as ResourceDetailsWithProvenance[];
