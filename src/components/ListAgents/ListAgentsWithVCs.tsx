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

import { Session } from "@inrupt/solid-client-authn-browser";
import { useContext, useEffect, useState } from "react";
import { isValidAccessGrant } from "@inrupt/solid-client-access-grants";
import { VerifiableCredentialApiConfiguration } from "@inrupt/solid-client-vc/dist/common/common";
import getRequestors from "../../helpers/requestors/requestors";
import { SessionContext } from "../../session/SessionProvider";
import Loader from "../Loader/Loader";
import ListAgents from "./ListAgents";
import { WorkerContext } from "../../session/WorkerProvider";

async function getAgents(
  accessEndpoint: string | undefined,
  endpointConfig: VerifiableCredentialApiConfiguration | undefined,
  session: Session,
  _isValidAccessGrant: (
    ..._args: Parameters<typeof isValidAccessGrant>
  ) => Promise<boolean>
) {
  const { webId } = session.info;
  const { fetch } = session;

  if (
    accessEndpoint === undefined ||
    endpointConfig === undefined ||
    typeof webId !== "string"
  ) {
    return [];
  }

  return [
    ...(await getRequestors({
      fetch,
      webId,
      accessEndpoint,
      isValidAccessGrant: _isValidAccessGrant,
      endpointConfiguration: endpointConfig,
    })),
  ];
}

function SuspendedList({
  onDetails,
  searchString,
  agents,
}: {
  onDetails: (_agent: string) => void;
  searchString: string;
  agents?: string[];
}) {
  if (agents === undefined) {
    return <Loader />;
  }
  return (
    <ListAgents
      agents={agents}
      onDetails={onDetails}
      searchString={searchString}
    />
  );
}

export default function ListAgentsWithVCs({
  onDetails,
  searchString,
  onNotEmptyAgents,
}: {
  onDetails: (_agent: string) => void;
  searchString: string;
  onNotEmptyAgents?: () => void;
}) {
  const { session, accessEndpoint, endpointConfiguration } =
    useContext(SessionContext);
  const { isValidAccessGrant } = useContext(WorkerContext);
  const [agents, setAgents] = useState<string[] | undefined>([]);

  useEffect(() => {
    if (accessEndpoint !== undefined && endpointConfiguration !== undefined) {
      // Use undefined value for agent list as a proxy for loading state.
      setAgents(undefined);
      getAgents(
        accessEndpoint,
        endpointConfiguration,
        session,
        isValidAccessGrant
      )
        .then(setAgents)
        .catch((error) => {
          console.error(error);
          setAgents([]);
        });
    }
  }, [accessEndpoint, endpointConfiguration, session, isValidAccessGrant]);

  useEffect(() => {
    if (agents !== undefined && agents.length > 0) {
      if (onNotEmptyAgents) {
        onNotEmptyAgents();
      }
    }
  }, [agents]);

  return (
    <SuspendedList
      agents={agents}
      onDetails={onDetails}
      searchString={searchString}
    />
  );
}
