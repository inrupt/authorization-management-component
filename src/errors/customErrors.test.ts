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

import { it, describe } from "@jest/globals";
import {
  AccessGrantsNotSupported,
  DiscoveryNotAvailable,
  WebIdNotAvailable,
} from "./customErrors";

describe("AccessGrantsNotSupported", () => {
  it("Adds a summary to the Error", () => {
    const e = new AccessGrantsNotSupported();
    expect(e.name).toBe(AccessGrantsNotSupported.ERROR_NAME);
  });

  it("Wraps the Error constructor", () => {
    const cause = new Error();
    const e = new AccessGrantsNotSupported("Test message", { cause });
    expect(e.message).toBe("Test message");
    expect(e.cause).toBe(cause);
  });
});

describe("DiscoveryNotAvailable", () => {
  it("Adds a summary to the Error", () => {
    const e = new DiscoveryNotAvailable();
    expect(e.name).toBe(DiscoveryNotAvailable.ERROR_NAME);
  });

  it("Wraps the Error constructor", () => {
    const cause = new Error();
    const e = new DiscoveryNotAvailable("Test message", { cause });
    expect(e.message).toBe("Test message");
    expect(e.cause).toBe(cause);
  });
});

describe("DiscoveryNotAvailable", () => {
  it("Adds a summary to the Error", () => {
    const e = new WebIdNotAvailable("Test message");
    expect(e.name).toBe(WebIdNotAvailable.ERROR_NAME);
  });

  it("Wraps the Error constructor", () => {
    const cause = new Error();
    const e = new WebIdNotAvailable("Test message", { cause });
    expect(e.message).toBe("Test message");
    expect(e.cause).toBe(cause);
  });
});
