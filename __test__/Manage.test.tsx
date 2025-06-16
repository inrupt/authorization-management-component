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
import { useRouter } from "next/router";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import type { Session } from "@inrupt/solid-client-authn-node";
import type { EventEmitter } from "stream";
import * as axe from "axe-core";
import ManagePage from "../pages/index";
import useReturnUrl from "../src/authentication/hooks/useReturnUrl";

import WorkerProvider from "../src/session/WorkerProvider.mock";
import SessionProvider from "../src/session/SessionProvider.mock";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("../src/authentication/hooks/useReturnUrl");
jest.mock("@inrupt/solid-client-authn-browser");
jest.mock("../src/helpers/requestors/requestors", () => ({
  __esModule: true,
  default: jest.fn(
    async () =>
      new Set([
        "https://id.inrupt.com/jeswrtest51",
        "https://id.inrupt.com/testuser12345?lookup",
      ]),
  ),
}));

describe("login page", () => {
  let session: Session;
  let handleIncomingRedirect: jest.Mock;
  let fetchFn: jest.Mock;

  beforeEach(() => {
    handleIncomingRedirect = jest.fn(() => session.info);
    fetchFn = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(),
    });
    (useReturnUrl as jest.Mock).mockReturnValue("/");

    session = {
      info: {
        isLoggedIn: true,
        webId: "https://fakeurl.com/me",
        sessionId: "abc123",
      },
      on: jest.fn(),
      handleIncomingRedirect,
      events: {
        on: jest.fn(),
      } as Partial<EventEmitter> as EventEmitter,
      login: jest.fn(),
      logout: jest.fn(),
      fetch: fetchFn,
    } as Partial<Session> as Session;

    (getDefaultSession as jest.Mock).mockReturnValue(session);
  });
  it("renders a manage page", async () => {
    const { asFragment, getByText, container } = render(
      <SessionProvider mockAccessEndpoint="https://example.org">
        <WorkerProvider>
          <ManagePage />
        </WorkerProvider>
      </SessionProvider>,
    );

    await waitFor(() => expect(getByText("Jesse Wright 🐨")).toBeVisible());
    expect(asFragment()).toMatchSnapshot();

    // Accessibility tests
    HTMLCanvasElement.prototype.getContext = jest.fn();
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
