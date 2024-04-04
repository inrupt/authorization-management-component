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
  MockParams,
  createMockAccessGrant,
  createMockAccessRequest,
} from "./access";

const mockInputs: MockParams[] = [
  {
    requestor: "https://id.inrupt.com/testuser12345?lookup",
    resources: [
      "https://storage.inrupt.com/2560cc06-1d8b-4a14-8682-5c33735845a9/photos/table.png",
    ],
    modes: ["Read", "Write"],
    purposes: ["https://w3id.org/dpv#Advertising"],
    expirationDate: "2023/11/12",
  },
  {
    requestor: "https://id.inrupt.com/testuser12345?lookup",
    resources: [
      "https://storage.inrupt.com/2560cc06-1d8b-4a14-8682-5c33735845a9/photos/table.png",
    ],
    modes: ["Read", "Write"],
    purposes: ["https://w3id.org/dpv#CommunicationForCustomerCare"],
    expirationDate: "2023/07/12",
  },
  {
    requestor: "https://id.inrupt.com/testuser12345?lookup",
    resources: [
      "https://storage.inrupt.com/2560cc06-1d8b-4a14-8682-5c33735845a9/photos/table.png",
    ],
    modes: ["Read"],
    purposes: ["https://anotherpurpose.com"],
    expirationDate: "2023/07/12",
  },
];

const mockInputsMultipleResources: MockParams[] = mockInputs.map((elem) => ({
  ...elem,
  resources: [
    ...elem.resources,
    "https://storage.inrupt.com/2560cc06-1d8b-4a14-8682-5c33735845a9/photos/table2.png",
  ],
}));

export const mockGrants = async () =>
  await Promise.all(mockInputs.map((input) => createMockAccessGrant(input)));
export const mockGrantsMultipleResources = mockInputsMultipleResources.map(
  (input) => createMockAccessGrant(input)
);
export const mockRequests = async () =>
  await Promise.all(mockInputs.map((input) => createMockAccessRequest(input)));
