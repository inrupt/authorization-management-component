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

import type { ReactElement } from "react";
import { isValidAccessGrant } from "@inrupt/solid-client-access-grants";

import type { IWorkerContext, IWorkerProvider } from "./WorkerProvider";
import { WorkerContext } from "./WorkerProvider";

const context: IWorkerContext = {
  getPurposeInfo: async (purpose: string) => {
    switch (purpose) {
      default:
        throw new Error("Unknown Purpose");
    }
  },
  getNameFromWebId: async (webId: string) => {
    switch (webId) {
      case "https://id.inrupt.com/jeswrtest51":
        return "Jesse Wright 🐨";
      case "https://id.inrupt.com/testuser12345?lookup":
        return "Virginia";
      default:
        throw new Error("Unknown webId");
    }
  },
  getImageFromWebId: async (webId: string) => {
    switch (webId) {
      case "https://id.inrupt.com/jeswrtest51":
        return "https://avatars.githubusercontent.com/u/63333554?v=4";
      case "https://id.inrupt.com/testuser12345?lookup":
        return "https://virginia.solidcommunity.net/profile/80e79c10-26b2-11ed-a130-d5bd0f09344f.jpeg";
      default:
        throw new Error("Unknown webId");
    }
  },
  getContentType: async () => null,
  async isValidAccessGrant(vc, options) {
    const valid = await isValidAccessGrant(vc, options);
    return valid.errors.length === 0;
  },
  nameRecord: {
    "https://id.inrupt.com/jeswrtest51": "Jesse Wright 🐨",
    "https://id.inrupt.com/testuser12345?lookup": "Virginia",
  },
};

/**
 * Used to provide session data to child components through context.
 */
export default function WorkerProvider({
  children,
}: IWorkerProvider): ReactElement {
  return (
    <WorkerContext.Provider value={context}>{children}</WorkerContext.Provider>
  );
}
