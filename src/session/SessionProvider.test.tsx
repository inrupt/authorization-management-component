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

import * as React from "react";
import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// There appears to be a TS issue with jest globals, but testing-library/react expects them to be present.
// eslint-disable @typescript-eslint/ban-ts-comment
// import { jest } from "@jest/globals";

import type { NextRouter, useRouter } from "next/router";
import type SolidClient from "@inrupt/solid-client";
import type { getProfileAll, getPodUrlAllFrom } from "@inrupt/solid-client";
import type SolidClientAuthnBrowser from "@inrupt/solid-client-authn-browser";
import type { Session } from "@inrupt/solid-client-authn-browser";
import type { EventEmitter } from "stream";
import SessionProvider, { SessionContext } from "./SessionProvider";

jest.mock("@inrupt/solid-client-authn-browser");
jest.mock("@inrupt/solid-client", () => {
  const actualSolidClient = jest.requireActual<typeof SolidClient>(
    "@inrupt/solid-client",
  );
  return {
    // @ts-expect-error Using jest globals causes issues with jest signatures.
    getProfileAll: jest.fn<typeof getProfileAll>().mockResolvedValue({
      webIdProfile: actualSolidClient.mockSolidDatasetFrom(
        "https://example.org/id",
      ),
      altProfileAll: [],
    }),
    // @ts-expect-error Using jest globals causes issues with jest signatures.
    getPodUrlAllFrom: jest.fn<typeof getPodUrlAllFrom>().mockReturnValue([]),
  };
});
jest.mock("next/router", () => ({
  useRouter: jest.fn().mockReturnValue({
    replace: jest.fn(),
    isReady: true,
  }),
}));

function ChildComponent(): React.ReactElement {
  const {
    session,
    sessionRequestInProgress,
    login: sessionLogin,
    logout: sessionLogout,
    state,
  } = React.useContext(SessionContext);

  return (
    <div>
      {sessionRequestInProgress && (
        <div data-testid="sessionRequestInProgress">
          sessionRequestInProgress
        </div>
      )}
      <div data-testid="state">{state}</div>
      <div data-testid="session">{JSON.stringify(session)}</div>
      <button type="button" onClick={async () => sessionLogin({})}>
        Login
      </button>
      <button
        type="button"
        onClick={async () => sessionLogout()}
        data-testid="logout"
      >
        Logout
      </button>
    </div>
  );
}

describe("Testing SessionContext", () => {
  let onError: jest.Mock;

  // @ts-expect-error Using jest globals causes issues with jest signatures.
  const handleIncomingRedirect = jest.fn<Session["handleIncomingRedirect"]>();
  let user: ReturnType<typeof userEvent.setup>;
  let session: Session;
  let documentBody: ReturnType<typeof render>;

  beforeEach(() => {
    session = {
      info: {
        isLoggedIn: false,
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
    } as Partial<Session> as Session;
    handleIncomingRedirect.mockResolvedValue(session.info);

    jest.requireMock<typeof SolidClientAuthnBrowser>(
      "@inrupt/solid-client-authn-browser",
    ).getDefaultSession = jest
      // @ts-expect-error Using jest globals causes issues with jest signatures.
      .fn<typeof SolidClientAuthnBrowser.getDefaultSession>()
      .mockReturnValue(session);
    onError = jest.fn();
    user = userEvent.setup();
  });

  it("calls onError if handleIncomingRedirect fails", async () => {
    handleIncomingRedirect.mockRejectedValueOnce(undefined);
    jest.requireMock<{
      useRouter: typeof useRouter;
      // @ts-expect-error Using jest globals causes issues with jest signatures.
    }>("next/router").useRouter = jest.fn<typeof useRouter>().mockReturnValue({
      replace: jest.fn(),
      isReady: true,
    } as unknown as NextRouter);
    render(
      <SessionProvider onError={onError}>
        <ChildComponent />
      </SessionProvider>,
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("uses the logout functions from session", async () => {
    session.info.isLoggedIn = true;
    act(() => {
      documentBody = render(
        <SessionProvider>
          <ChildComponent />
        </SessionProvider>,
      );
    });

    await waitFor(() => {
      expect(handleIncomingRedirect).not.toHaveBeenCalled();
    });

    const { getByText } = documentBody;

    expect(session.login).not.toHaveBeenCalled();
    expect(session.logout).not.toHaveBeenCalled();

    await user.click(getByText("Login"));
    expect(session.login).toHaveBeenCalledTimes(0);
    await user.click(getByText("Logout"));
    expect(session.logout).toHaveBeenCalledTimes(1);
  });

  describe("Resolving handleIncomingRedirect", () => {
    beforeEach(() => {
      handleIncomingRedirect.mockResolvedValueOnce(
        Promise.resolve(session.info),
      );
    });

    it("matches snapshot", async () => {
      act(() => {
        documentBody = render(
          <SessionProvider>
            <ChildComponent />
          </SessionProvider>,
        );
      });

      await waitFor(() => {
        expect(session.handleIncomingRedirect).toHaveBeenCalled();
      });

      const { getByText } = documentBody;
      await waitFor(() => {
        expect(getByText("unauthenticated")).toBeInTheDocument();
      });

      const { baseElement } = documentBody;
      expect(baseElement).toMatchSnapshot();
    });

    it("uses the login functions from session", async () => {
      act(() => {
        documentBody = render(
          <SessionProvider>
            <ChildComponent />
          </SessionProvider>,
        );
      });

      await waitFor(() => {
        expect(handleIncomingRedirect).toHaveBeenCalled();
      });

      const { getByText } = documentBody;
      await waitFor(() => {
        expect(getByText("unauthenticated")).toBeInTheDocument();
      });

      expect(session.login).not.toHaveBeenCalled();
      expect(session.logout).not.toHaveBeenCalled();

      await user.click(getByText("Login"));
      expect(session.login).toHaveBeenCalledTimes(1);
      await user.click(getByText("Logout"));
      expect(session.logout).toHaveBeenCalledTimes(0);
    });
  });

  it.each(["Login", "Logout"])(
    "calls onError if there is an error during %s",
    async (selector) => {
      (
        session[selector.toLowerCase() as "login" | "logout"] as jest.Mock
      ).mockRejectedValueOnce(null);

      session.info.isLoggedIn = selector !== "Login";

      session.handleIncomingRedirect = jest.fn(async () => session.info);

      const { getByText } = render(
        <SessionProvider onError={onError}>
          <ChildComponent />
        </SessionProvider>,
      );

      await waitFor(() => {
        expect(session.handleIncomingRedirect).toHaveBeenCalledTimes(
          selector === "Login" ? 1 : 0,
        );
      });

      await user.click(getByText(selector));

      expect(onError).toHaveBeenCalledTimes(1);
    },
  );
});
