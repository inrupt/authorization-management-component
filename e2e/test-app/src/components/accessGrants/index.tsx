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

import {
  deleteFile,
  getPodUrlAll,
  getSourceUrl,
  saveFileInContainer,
} from "@inrupt/solid-client";
import {
  getResources,
  redirectToAccessManagementUi,
  GRANT_VC_URL_PARAM_NAME,
} from "@inrupt/solid-client-access-grants";
import type { DatasetWithId } from "@inrupt/solid-client-vc";
import { verifiableCredentialToDataset } from "@inrupt/solid-client-vc";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { useRouter } from "next/router";
import { useState } from "react";
import { v4 } from "uuid";
import { retryAsync } from "../../utils";

const session = getDefaultSession();
const SHARED_FILE_CONTENT = "Some content.\n";

export default function AccessGrant({
  setErrorMessage,
}: {
  setErrorMessage: (_msg: string) => void;
}) {
  const [accessGrant, setAccessGrant] = useState<string>();
  const [accessRequest, setAccessRequest] = useState<DatasetWithId>();
  const [accessGrantBody, setAccessGrantBody] = useState<DatasetWithId>();
  const [sharedResourceIri, setSharedResourceIri] = useState<string>();
  const [resourceBody, setResourceBody] = useState<string>();
  const router = useRouter();

  const handleCreate = async () => {
    if (typeof sharedResourceIri === "string") {
      // If a resource already exist, do nothing
      return;
    }

    if (typeof session.info.webId !== "string") {
      setErrorMessage("You must be authenticated to create a resource.");
      return;
    }
    // Create a file in the resource owner's Pod
    const resourceOwnerPodAll = await getPodUrlAll(session.info.webId);
    if (resourceOwnerPodAll.length === 0) {
      setErrorMessage(
        "The Resource Owner WebID Profile is missing a link to at least one Pod root.",
      );
    }
    try {
      const savedFile = await retryAsync(() =>
        saveFileInContainer(
          resourceOwnerPodAll[0],
          new File([SHARED_FILE_CONTENT], v4(), {
            type: "text/plain",
          }),
          {
            fetch: session.fetch,
          },
        ),
      );
      setSharedResourceIri(getSourceUrl(savedFile));
    } catch (_e) {
      setSharedResourceIri("Resource creation failed");
    }
  };

  const handleDelete = async () => {
    if (typeof sharedResourceIri !== "string") {
      // If no resource exist, do nothing
      return;
    }
    await deleteFile(sharedResourceIri, {
      fetch: session.fetch,
    });
    setSharedResourceIri(undefined);
  };

  const handleRequestAccess = async () => {
    const reqBody = {
      resource: sharedResourceIri,
      webid: session.info.webId,
    };
    const typeRequest = await retryAsync(() =>
      fetch("http://localhost:8080/api/accessRequest", {
        body: JSON.stringify(reqBody),
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }),
    );

    const grantInfo = await verifiableCredentialToDataset(
      (await typeRequest.json()).accessRequest,
    );
    setAccessRequest(grantInfo);
  };

  const handleCallAuthedGrant = async () => {
    if (!accessGrant) return;

    const fetchedAccessGrant = await retryAsync(() =>
      fetch("http://localhost:8080/api/accessGrant", {
        body: JSON.stringify({ grantUrl: accessGrant }),
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }),
    );
    const grantInfo = await verifiableCredentialToDataset(
      (await fetchedAccessGrant.json()).accessGrant,
    );
    setSharedResourceIri(getResources(grantInfo)[0]);
    setAccessGrantBody(grantInfo);
  };

  const handleGrantResponse = async () => {
    if (
      typeof router.query[`${GRANT_VC_URL_PARAM_NAME}`] === "string" &&
      router.query[`${GRANT_VC_URL_PARAM_NAME}`] !== ""
    ) {
      setAccessGrant(router.query[`${GRANT_VC_URL_PARAM_NAME}`] as string);
    }
  };

  const handleResourceGetResponse = async () => {
    const reqBody = {
      resource: sharedResourceIri,
      grant: accessGrant,
    };
    const typeRequest = await fetch("http://localhost:8080/api/resource", {
      body: JSON.stringify(reqBody),
      method: "PUT",
      headers: { "Content-Type": "application/text" },
    });
    const data = await typeRequest.json();
    setResourceBody(data.dataset);
  };

  return (
    <>
      <div>
        <button
          onClick={async () => handleCreate()}
          data-testid="create-resource"
          type="button"
        >
          Create resource
        </button>
        <button
          onClick={async () => handleDelete()}
          data-testid="delete-resource"
          type="button"
        >
          Delete resource
        </button>
      </div>
      <p>
        Created resource:{" "}
        <span data-testid="resource-iri">{sharedResourceIri}</span>
      </p>
      <div>
        <button
          type="button"
          data-testid="request-access"
          onClick={async () => handleRequestAccess()}
        >
          Request access to resource
        </button>
      </div>
      <p>
        Access request URL:{" "}
        <span data-testid="access-request-url">
          {accessRequest ? accessRequest.id : ""}
        </span>
      </p>
      <div>
        <button
          type="button"
          data-testid="grant-access"
          onClick={async () => {
            if (!accessRequest) return;
            await redirectToAccessManagementUi(
              accessRequest,
              window.location.href,
              {
                redirectCallback: (url) => {
                  return router.push(url);
                },
                // The following IRI redirects the user so that they can approve/deny the request.
                fallbackAccessManagementUi: `http:localhost:3000/accessRequest/`,
                // Note: the following is only necessary because this project depends for testing purpose
                // on solid-client-authn-browser, which is picked up automatically for convenience in
                // browser-side apps. A typical node app would not have this dependence.
                fetch: session.fetch,
              },
            );
          }}
        >
          Redirect to access management UI
        </button>
      </div>
      <p>
        Granted access:{" "}
        <span data-testid="access-grant-url">{accessGrant}</span>
      </p>

      <button
        type="button"
        onClick={async () => handleCallAuthedGrant()}
        data-testid="get-authed-grant"
      >
        Authenticated Fetch of Grant
      </button>

      <pre data-testid="access-grant">
        {JSON.stringify(accessGrantBody, null, 2)}
      </pre>
      <button
        type="button"
        onClick={async () => handleGrantResponse()}
        data-testid="handle-grant-response"
      >
        Handle Grant Response
      </button>
      <p data-testid="resource-body">{resourceBody}</p>
      <button
        type="button"
        onClick={async () => handleResourceGetResponse()}
        data-testid="handle-resource-get-response"
      >
        App GETS resource with AccessGrant
      </button>
    </>
  );
}
