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
  AccessGrant,
  getResources,
  isValidAccessGrant,
  DatasetWithId,
} from "@inrupt/solid-client-access-grants";
import { Session } from "@inrupt/solid-client-authn-browser";
import Link from "next/link";
import { useRouter } from "next/router";
import { Suspense, useCallback, useContext, useState } from "react";
import { VerifiableCredentialApiConfiguration } from "@inrupt/solid-client-vc/dist/common/common";
import AuthenticatedRoute from "../../src/authentication/context/AuthenticatedRoute";
import { resourceDetails } from "../../src/components/AccessRequest/utils/getResources";
import { ErrorModal } from "../../src/components/ErrorModal/ErrorModal";
import Header from "../../src/components/Header/Header";
import Loader from "../../src/components/Loader/Loader";
import {
  DisplayAgent,
  DisplayImage,
} from "../../src/components/PromiseText/PromiseText";
import ResourceList, {
  ResourceDetailsWithProvenance,
} from "../../src/components/ResourceList/ResourceList";
import RevokeButton from "../../src/components/RevokeButton/RevokeButton";
import Sidebar from "../../src/components/Sidebar/Sidebar";
import {
  getGroupedAccessModes,
  getLatestExpirationDate,
} from "../../src/helpers/access/access";
import getValidAccessGrants from "../../src/helpers/access/getValidAccessGrants";
import useAsync from "../../src/helpers/suspense/useAsync";
import { PromiseResult } from "../../src/helpers/suspense/wrapPromise";
import { SessionContext } from "../../src/session/SessionProvider";
import { WorkerContext } from "../../src/session/WorkerProvider";
import rootStyles from "../Home.module.scss";
import styles from "./Resources.module.scss";
import GrantActions from "../../src/components/GrantActions/GrantActions";

function getAllResourcesFromGrants(
  grants: DatasetWithId[],
  session: Session
): ResourceDetailsWithProvenance[] {
  const record: Record<string, DatasetWithId[]> = {};

  for (const grant of grants) {
    for (const resource of getResources(grant)) {
      (record[resource] ??= []).push(grant);
    }
  }

  return Object.entries(record).map(([resource, groupedGrants]) => {
    return {
      ...resourceDetails({
        resources: [resource],
        fetch: session.fetch,
      })[0],
      expiry: getLatestExpirationDate(
        groupedGrants as unknown as AccessGrant[]
      ),
      access: getGroupedAccessModes(groupedGrants as unknown as AccessGrant[]),
      grants: groupedGrants,
    };
  });
}

async function getAllGrants(
  accessEndpoint: string | undefined,
  endpointConfiguration: VerifiableCredentialApiConfiguration | undefined,
  agent: string | undefined | string[],
  session: Session,
  _isValidAccessGrant: (
    ..._args: Parameters<typeof isValidAccessGrant>
  ) => Promise<boolean>
): Promise<DatasetWithId[]> {
  if (
    session.info.isLoggedIn &&
    typeof accessEndpoint === "string" &&
    typeof agent === "string" &&
    typeof endpointConfiguration === "object"
  ) {
    return getValidAccessGrants(
      _isValidAccessGrant,
      { requestor: agent },
      {
        fetch: session.fetch,
        includeExpired: false,
        accessEndpoint,
        endpointConfiguration,
      }
    );
  }

  throw new Error("Unexpected inputs");
}

function ResourceListSuspense({
  onDetails,
  getResources,
  agent,
  getGrants,
  onRevoke,
}: {
  getResources: () => PromiseResult<ResourceDetailsWithProvenance[]>;
  onDetails: (_data: ResourceDetailsWithProvenance) => void;
  agent: string;
  getGrants: () => PromiseResult<DatasetWithId[]>;
  onRevoke: () => void;
}) {
  const resources = getResources();
  const grants = getGrants();

  if (resources.status === "error" || grants.status === "error") {
    return (
      <ErrorModal
        // FIXME: replace useAsync by traditional seEffect/useState,
        // and throw appropriate error here if applicable.
        err={grants.value as Error}
        isOpen
        onClose={() => {
          /* noop */
        }}
        onReload={onRevoke}
      />
    );
  }

  if (grants.value.length === 0 && resources.value.length === 0) {
    return (
      <div>
        <b>
          <DisplayAgent url={agent} /> has not been granted access to any
          resources
        </b>
      </div>
    );
  }

  return (
    <>
      <div>
        <b>
          <DisplayAgent url={agent} /> has access to the resources below
        </b>
      </div>
      <ResourceList
        data={resources.value}
        onDetails={onDetails}
        agent={agent}
        onRevoke={onRevoke}
      />
    </>
  );
}

function SidebarSuspense({
  agent,
  resource,
  isOpen,
  onClose,
  onRefresh,
}: {
  agent: string;
  resource: ResourceDetailsWithProvenance;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  return (
    <Sidebar
      resourceIri={resource.key}
      requestor={agent}
      grants={resource.grants}
      isOpen={isOpen}
      onClose={onClose}
      onRefresh={onRefresh}
      data-testid={`details-agent[${agent}]-resource[${resource}]`}
    />
  );
}

function RevokerSuspense({
  getGrants,
  agent,
  onRefresh,
}: {
  getGrants: () => PromiseResult<DatasetWithId[]>;
  agent: string;
  onRefresh: () => void;
}) {
  const data = getGrants();
  const [actionClicked, setActionClicked] = useState<boolean>(false);

  if (data.status === "error" || data.value.length === 0) {
    // If the grants cannot be loaded then we should not display a button
    // to revoke them
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  return (
    <GrantActions
      testidSuffix=""
      actionClicked={actionClicked}
      setActionClicked={setActionClicked}
      isSidebar={false}
      popoverPlacement="right"
    >
      <RevokeButton
        agent={agent}
        grants={data.value}
        onRevoke={onRefresh}
        onClick={() => {
          setActionClicked(true);
        }}
        variant="outline-clear"
      />
    </GrantActions>
  );
}

export default function ResourcesPage() {
  const {
    query: { agent },
    replace,
  } = useRouter();
  const { session, accessEndpoint, endpointConfiguration } =
    useContext(SessionContext);
  const { isValidAccessGrant } = useContext(WorkerContext);
  const { read: getGrants, forceReload: onRevoke } = useAsync(getAllGrants, [
    accessEndpoint,
    endpointConfiguration,
    agent,
    session,
    isValidAccessGrant,
  ]);
  const getResources = useCallback((): PromiseResult<
    ResourceDetailsWithProvenance[]
  > => {
    const data = getGrants();

    if (data.status === "error") {
      return data;
    }

    return {
      status: "success",
      value: getAllResourcesFromGrants(data.value, session),
    };
  }, [getGrants, session]);
  const [resource, setResource] = useState<ResourceDetailsWithProvenance>();

  return (
    <AuthenticatedRoute>
      <>
        <Header>
          <h1 className={rootStyles.subheader}>Manage Access</h1>
        </Header>

        <main className={styles["main-resource-view"]}>
          <Link href="/" className={styles["back-div"]}>
            <i
              className={`bi bi-chevron-left ${styles["back-icon"]}`}
              title="back icon"
            />
            back
          </Link>

          {typeof agent === "string" && (
            <>
              <div className={styles["agent-info-box"]}>
                <DisplayImage url={agent} className={styles["agent-icon"]} />
                <div>
                  <h2>
                    <DisplayAgent url={agent} fallback={agent} />
                  </h2>
                  <DisplayAgent url={agent} fallback="" />
                </div>
                <div className={styles["revoke-button"]}>
                  <Suspense>
                    <RevokerSuspense
                      getGrants={getGrants}
                      agent={agent}
                      onRefresh={() => {
                        // After revocation we redirect back to the /manage page because there
                        // should be no more access grants applicable to the agent
                        return replace("/");
                      }}
                    />
                  </Suspense>
                </div>
              </div>

              <Suspense fallback={<Loader />}>
                <ResourceListSuspense
                  getResources={getResources}
                  onDetails={(resource) => {
                    setResource(resource);
                  }}
                  agent={agent}
                  getGrants={getGrants}
                  onRevoke={onRevoke}
                />
              </Suspense>
            </>
          )}

          <Suspense>
            {typeof agent === "string" && resource !== undefined && (
              <SidebarSuspense
                agent={agent}
                resource={resource}
                isOpen
                onClose={() => setResource(undefined)}
                onRefresh={onRevoke}
              />
            )}
          </Suspense>
        </main>
      </>
    </AuthenticatedRoute>
  );
}
