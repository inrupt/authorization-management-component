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

import { AccessGrant, DatasetWithId } from "@inrupt/solid-client-access-grants";
import * as accessHelpers from "./access";
import { mockGrants } from "./mocks";

describe("access helpers", () => {
  let grants: DatasetWithId[];

  beforeEach(async () => {
    grants = await mockGrants();
  });

  describe("getGroupedAccessModes", () => {
    it("returns grouped access modes from an array of Access Grants", () => {
      expect(accessHelpers.getGroupedAccessModes(grants)).toEqual({
        read: true,
        write: true,
        append: false,
      });
    });
  });
  describe("getGroupedPurposes", () => {
    it("returns grouped purposes urls from an array of grants", () => {
      expect(accessHelpers.getGroupedPurposes(grants as AccessGrant[])).toEqual(
        [
          "https://w3id.org/dpv#Advertising",
          "https://w3id.org/dpv#CommunicationForCustomerCare",
          "https://anotherpurpose.com",
        ],
      );
    });
  });
  describe("getLatestExpirationDate", () => {
    it("returns latest expiration date from an array of grants", () => {
      expect(accessHelpers.getLatestExpirationDate(grants)?.toString()).toBe(
        "Sun Nov 12 2023 00:00:00 GMT+0000 (Coordinated Universal Time)",
      );
    });
  });

  describe("getIconClassNameForAccessMode", () => {
    it("returns icon className for a given access mode", () => {
      expect(accessHelpers.getIconClassNameForAccessMode("read")).toBe(
        "bi bi-eye-fill",
      );
      expect(accessHelpers.getIconClassNameForAccessMode("write")).toBe(
        "bi bi-pencil-fill",
      );
      expect(accessHelpers.getIconClassNameForAccessMode("append")).toBe(
        "bi bi-folder-plus",
      );
    });
  });
});
