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

import type { ReactElement, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Session } from "@inrupt/solid-client-authn-browser";
import {
  fetch,
  getDefaultSession,
  login,
  logout,
} from "@inrupt/solid-client-authn-browser";

import { useRouter } from "next/router";
import { getPodUrlAllFrom, getProfileAll } from "@inrupt/solid-client";
import { getAccessApiEndpoint } from "@inrupt/solid-client-access-grants";
import { getVerifiableCredentialApiConfiguration } from "@inrupt/solid-client-vc";
import type { VerifiableCredentialApiConfiguration } from "@inrupt/solid-client-vc/dist/common/common";
import {
  WebIdNotAvailable,
  DiscoveryNotAvailable,
  AccessGrantsNotSupported,
} from "../../src/errors/customErrors";
import { ProfileModal } from "../components/ProfileModal/ProfileModal";
import { ErrorModal } from "../components/ErrorModal/ErrorModal";

type AuthState =
  | "waiting"
  | "authenticating"
  | "unauthenticated"
  | "authenticated"
  | "pre-authenticating";

export interface ISessionContext {
  login: typeof login;
  logout: typeof logout;
  session: Session;
  fetch: typeof fetch;
  sessionRequestInProgress: boolean;
  state: AuthState;
  accessEndpoint?: string;
  endpointConfiguration?: VerifiableCredentialApiConfiguration;
}

export const createContextBase: () => ISessionContext = () => ({
  login,
  logout,
  fetch,
  session: getDefaultSession(),
  sessionRequestInProgress: true,
  accessEndpoint: undefined,
  state: "waiting",
  endpointConfiguration: undefined,
});

export const SessionContext =
  createContext<ISessionContext>(createContextBase());

/* eslint react/require-default-props: 0 */
export interface ISessionProvider {
  children: ReactNode;
  onError?: (_error: Error) => void;
  restorePreviousSession?: boolean;
}

/**
 * @param session
 * @param callback The callback should mutate react state to trigger re-rendering.
 */
const discoverAccessEndpoint = async (
  session: Session,
  callback: (endpoint: string) => void,
): Promise<void> => {
  if (typeof session.info.webId !== "string") {
    return;
  }
  let profiles;
  try {
    profiles = await getProfileAll(session.info.webId, {
      fetch: session.fetch,
    });
  } catch (e: unknown) {
    throw new WebIdNotAvailable(
      `An error occured when looking up WebID ${session.info.webId}: ${e}`,
    );
  }
  const pods = getPodUrlAllFrom(profiles, session.info.webId);
  if (pods.length < 1) {
    throw new Error(
      `No Pods could be discovered from WebID ${session.info.webId}`,
    );
  }
  // FIXME arbitrarily pick the first Pod.
  const [podRoot] = pods;
  let endpoint;
  try {
    endpoint = await getAccessApiEndpoint(podRoot);
  } catch (e: unknown) {
    throw new DiscoveryNotAvailable(
      `Access endpoint discovery for Pod ${podRoot} failed: ${e}`,
    );
  }
  callback(endpoint);
};

const HintModal = ({
  error,
  modalStatus,
  modalControl,
}: {
  error?: Error;
  modalStatus: boolean;
  modalControl: (status: boolean) => void;
}) => {
  if (error === undefined) {
    return <></>;
  }
  if (error instanceof WebIdNotAvailable) {
    return (
      <ProfileModal
        isOpen={modalStatus}
        onClose={() => {
          modalControl(false);
        }}
      />
    );
  }
  if (error instanceof DiscoveryNotAvailable) {
    return (
      <ErrorModal
        err={
          new AccessGrantsNotSupported(
            "Your Pod Provider doesn't appear to support Access Grants. Please retry using a compliant Pod Provider.",
            {
              cause: error,
            },
          )
        }
        isOpen={modalStatus}
        onClose={() => {
          modalControl(false);
        }}
      />
    );
  }
  return (
    <ErrorModal
      err={error}
      isOpen={modalStatus}
      onClose={() => {
        modalControl(false);
      }}
    />
  );
};

/**
 * Used to provide session data to child components through context.
 */
export default function SessionProvider({
  children,
  onError,
  restorePreviousSession,
}: ISessionProvider): ReactElement {
  const { replace, isReady } = useRouter();
  const session = useMemo(getDefaultSession, []);

  const [state, setState] = useState<AuthState>(
    session.info.isLoggedIn ? "authenticated" : "waiting",
  );

  const [accessEndpoint, setAccessEndpoint] = useState<string>();
  const [accessEndpointConfig, setAccessEndpointConfig] =
    useState<VerifiableCredentialApiConfiguration>();
  const [modalOpen, setModalOpen] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<Error>();

  const isAuthenticated = state === "authenticated";
  const isUnAuthenticated = state === "unauthenticated";

  useEffect(() => {
    if (isReady) {
      if (state === "waiting") {
        setState("authenticating");
      } else if (state === "authenticating") {
        session
          .handleIncomingRedirect({
            url: window.location.href,
            restorePreviousSession,
          })
          .then((res) => {
            setState(res?.isLoggedIn ? "authenticated" : "unauthenticated");
          })
          .catch((error) => {
            if (onError) {
              onError(error as Error);
            } else {
              throw error;
            }
            setState(
              session.info?.isLoggedIn ? "authenticated" : "unauthenticated",
            );
          });
      }
    }
  }, [state, isReady, onError, replace, session, restorePreviousSession]);

  useEffect(() => {
    session.events.on("logout", () => {
      if (isAuthenticated || isUnAuthenticated) {
        setState("waiting");
      }
    });
  }, []);

  useEffect(() => {
    if (state === "authenticated") {
      discoverAccessEndpoint(session, (endpoint: string) => {
        setAccessEndpoint(endpoint);
      }).catch((e) => {
        if (e instanceof Error) {
          setErrorState(e);
        } else {
          console.error(`An error occured: ${e}`);
        }
      });
    }
  }, [state]);

  useEffect(() => {
    if (typeof accessEndpoint === "string") {
      getVerifiableCredentialApiConfiguration(accessEndpoint).then(
        setAccessEndpointConfig,
        (error: unknown) => {
          if (error instanceof Error) {
            setErrorState(error);
          } else {
            console.error(`An error occured: ${error}`);
          }
        },
      );
    }
  }, [accessEndpoint]);

  const loginCallback = useCallback(
    async (options: Parameters<Session["login"]>[0]) => {
      if (isUnAuthenticated) {
        setState("pre-authenticating");
        try {
          await session.login(options);
        } catch (error) {
          if (onError) {
            onError(error as Error);
          } else {
            throw error;
          }
        } finally {
          setState("unauthenticated");
        }
      }
    },
    [isUnAuthenticated, onError, session],
  );

  const logoutCallback = useCallback(
    async (options: Parameters<Session["logout"]>[0]) => {
      if (isAuthenticated) {
        try {
          await session.logout(options);
          setState("unauthenticated");
        } catch (error) {
          if (onError) {
            onError(error as Error);
          } else {
            throw error;
          }
        }
      }
    },
    [isAuthenticated, onError, session],
  );

  const value = useMemo<ISessionContext>(
    () => ({
      login: loginCallback,
      logout: logoutCallback,
      fetch: session.fetch,
      session,
      sessionRequestInProgress:
        state === "waiting" || state === "authenticating",
      state,
      accessEndpoint,
      endpointConfiguration: accessEndpointConfig,
    }),
    [
      loginCallback,
      logoutCallback,
      state,
      session,
      accessEndpoint,
      accessEndpointConfig,
    ],
  );

  return (
    <SessionContext.Provider value={value}>
      <>
        <HintModal
          modalControl={setModalOpen}
          modalStatus={modalOpen}
          error={errorState}
        ></HintModal>
        {children}
      </>
    </SessionContext.Provider>
  );
}
