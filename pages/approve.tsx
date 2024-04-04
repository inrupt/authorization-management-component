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

/* eslint-disable no-console */
import {
  AccessRequest as AccessRequestType,
  GRANT_VC_URL_PARAM_NAME,
  approveAccessRequest,
  denyAccessRequest,
  getAccessRequest,
  getRequestor,
  getResourceOwner,
} from "@inrupt/solid-client-access-grants";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AuthenticatedRoute from "../src/authentication/context/AuthenticatedRoute";
import AccessRequest from "../src/components/AccessRequest/AccessRequest";
import Modal from "../src/components/Modal/ControlledModal";
import { SessionContext } from "../src/session/SessionProvider";
import styles from "./Home.module.scss";
import { DisplayAgent } from "../src/components/PromiseText/PromiseText";
import { WorkerContext } from "../src/session/WorkerProvider";
import ModalLoader from "../src/components/Loader/ModalLoader";
import { ErrorModal, errString } from "../src/components/ErrorModal/ErrorModal";

const REQUEST_VC_URL_PARAM_NAME = "requestVcUrl";
const REDIRECT_URL_PARAM_NAME = "redirectUrl";

interface Signed {
  type: "Approved" | "Denied";
  vc: string;
}

function Approval({
  accessRequest,
  postLogoutUrl,
}: {
  accessRequest: string;
  postLogoutUrl: string;
}) {
  const router = useRouter();
  const { fetch: sessionFetch, session, logout } = useContext(SessionContext);
  const { getNameFromWebId } = useContext(WorkerContext);
  const [request, setRequest] = useState<AccessRequestType | null>(null);
  const [err, setErr] = useState<any>(null);
  const [loadingApproveDeny, setLoadingApproveDeny] = useState(false);
  const [approveDenyError, setApproveDenyError] = useState<any>(false);
  const [signed, setSigned] = useState<Signed>();

  const fetchAccessRequest = useCallback(() => {
    setRequest(null);
    setErr(null);
    getAccessRequest(accessRequest, { fetch: sessionFetch })
      .then(async (res) => {
        // Start loading the WebId in advance of displaying the accessRequest
        await Promise.race([
          getNameFromWebId(getRequestor(res)).catch(() => {
            /* noop */
          }),
          // Wait for up to 0.5s for the WebId to load before
          // displaying the accessRequest
          new Promise((response) => {
            setTimeout(response, 500);
          }),
        ]);
        setRequest(res);
      })
      .catch((error) => setErr(error));
  }, [accessRequest, sessionFetch, getNameFromWebId]);

  useEffect(fetchAccessRequest, [fetchAccessRequest]);

  return (
    <>
      {/* Loading */}
      <ModalLoader isOpen={request ? loadingApproveDeny : !err} />
      {/* Confirmation screen */}
      {request && signed && (
        <Modal
          title={`Access Request ${signed.type}`}
          variant="confirmation"
          primaryActionText="OK"
          confirmationImage={`bi bi-${
            signed.type === "Approved" ? "check-circle-fill" : "slash-circle"
          }`}
          onClose={() =>
            router.replace({
              pathname: postLogoutUrl,
              query: {
                [GRANT_VC_URL_PARAM_NAME]: signed.vc,
              },
            })
          }
          isOpen
        >
          {signed.type === "Approved" ? (
            <>
              Access successfully confirmed for{" "}
              <DisplayAgent url={getRequestor(request)} />
            </>
          ) : (
            <>
              You have denied <DisplayAgent url={getRequestor(request)} />{" "}
              access to all resources in this access request
            </>
          )}
        </Modal>
      )}
      <Modal
        title="You Need Permission to Approve"
        variant="confirmation"
        primaryActionText="Login"
        secondaryActionText="Cancel"
        confirmationImage="bi bi-shield-fill-exclamation"
        onPrimaryAction={() =>
          logout({
            logoutType: "idp",
            postLogoutUrl: new URL("/", window.location.href).toString(),
          })
        }
        onSecondaryAction={() => router.replace(postLogoutUrl)}
        isOpen={!!err && errString(err).includes("403 Forbidden")}
        onClose={() => {
          /* noop */
        }}
      >
        You do not have permissions to approve this request for data.
        <br />
        <br />
        You are currently logged in as{" "}
        <DisplayAgent url={session.info.webId!} />, are you sure this is the
        correct user?
      </Modal>
      <ErrorModal
        err={err}
        isOpen={!!err && !errString(err).includes("403 Forbidden")}
        onClose={() => {
          /* noop */
        }}
        onReload={fetchAccessRequest}
      />
      {request && (
        <Modal
          title="You Need Permission to Approve"
          variant="confirmation"
          primaryActionText="Login"
          secondaryActionText="Cancel"
          confirmationImage="bi bi-shield-fill-exclamation"
          onPrimaryAction={() =>
            logout({
              logoutType: "idp",
              postLogoutUrl: new URL("/", window.location.href).toString(),
            })
          }
          onSecondaryAction={async () => {
            await router.replace(postLogoutUrl);
          }}
          isOpen={session.info.webId !== getResourceOwner(request)}
          onClose={() => {
            /* noop */
          }}
        >
          You do not have permissions to approve this request for data.
          <br />
          <br />
          You are currently logged in as{" "}
          <DisplayAgent url={session.info.webId!} />, but the data owner is{" "}
          {getResourceOwner(request) && (
            <DisplayAgent url={getResourceOwner(request)!} />
          )}
          . Log back in as{" "}
          {getResourceOwner(request) && (
            <DisplayAgent url={getResourceOwner(request)!} />
          )}
          ?
        </Modal>
      )}
      <Modal
        title="Failed to submit Access Request"
        variant="confirmation"
        onClose={() => setApproveDenyError(false)}
        isOpen={!!approveDenyError}
      >
        Action failed - please try again
        <br />
        <br />
        <code>
          {approveDenyError && "message" in approveDenyError
            ? `${approveDenyError}`
            : `${approveDenyError.message}`}
        </code>
      </Modal>
      {request && (
        <AccessRequest
          accessRequest={request}
          onExpired={() =>
            router.replace({
              pathname: postLogoutUrl,
            })
          }
          onSubmit={async (data) => {
            setLoadingApproveDeny(true);

            try {
              if (data.action === "approve") {
                // We need the result of this to get the URL for the signed access grant
                const signedVc = await approveAccessRequest(
                  request.id,
                  data.overrides,
                  {
                    fetch: sessionFetch,
                  }
                );
                setSigned({ type: "Approved", vc: signedVc.id });
                setLoadingApproveDeny(false);
              } else {
                const denial = await denyAccessRequest(request.id, {
                  fetch: sessionFetch,
                });
                setSigned({ type: "Denied", vc: denial.id });
                setLoadingApproveDeny(false);
              }
            } catch (e) {
              setApproveDenyError(e);
              setLoadingApproveDeny(false);
            }
          }}
          fetch={sessionFetch}
        />
      )}
    </>
  );
}

function toString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function AccessRequestDisplay(): ReactElement {
  const { query, replace, pathname } = useRouter();
  const [data, setData] = useState<{ vc?: string; redirect?: string }>({});
  const { length } = Object.keys(query);

  useEffect(() => {
    if (length > 0) {
      setData({
        vc: toString(query[REQUEST_VC_URL_PARAM_NAME]),
        redirect: toString(query[REDIRECT_URL_PARAM_NAME]),
      });
      // Use useEffect must be of type () => void so we cannot return a promise
      // here.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      replace({
        pathname,
      });
    } else if (typeof data.vc !== "string") {
      // Use useEffect must be of type () => void so we cannot return a promise
      // here.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      replace({
        pathname: "/approveDetails",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  return (
    <div className={styles.container}>
      <Head>
        <title>AMC</title>
        <meta
          name="description"
          content="An Authorization Management Component"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.pickerContainer}>
          {typeof data.vc === "string" && typeof data.redirect === "string" && (
            <AuthenticatedRoute>
              <Approval accessRequest={data.vc} postLogoutUrl={data.redirect} />
            </AuthenticatedRoute>
          )}
        </div>
      </main>
    </div>
  );
}

export default AccessRequestDisplay;
