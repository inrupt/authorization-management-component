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

import { useContext, useMemo } from "react";
import { Table } from "reactstrap";
import { comp, useOrdered } from "../../hooks/useOrdered";
import { WorkerContext } from "../../session/WorkerProvider";
import { DisplayAgent, DisplayImage } from "../PromiseText/PromiseText";
import { DetailsIcon, Thead } from "../SortedTable/SortedTable";
import styles from "../SortedTable/SortedTable.module.scss";
import style from "./ListAgents.module.scss";

const headings = [
  {
    key: "image",
    name: "Icon",
    hidden: true,
  },
  {
    key: "name",
    name: "Name",
    sortBy: comp,
  },
  {
    key: "webId",
    name: "WebID",
    sortBy: comp,
  },
  {
    key: "key",
    name: "Resources",
  },
];

function EmptyAgentPage() {
  return (
    <div className={`${style["empty-grant-container"]}`}>
      <i className={`bi bi-inboxes-fill ${style["empty-inbox"]}`} />
      <p>
        <strong>You have not yet granted access to anyone.</strong>
      </p>
      <p>
        Once you have granted access, you will be able to see it on this page.
      </p>
    </div>
  );
}

function AgentTable({
  agents,
  onDetails,
  searchString,
}: {
  agents: string[];
  onDetails: (_agent: string) => void;
  searchString: string | undefined;
}) {
  const { nameRecord } = useContext(WorkerContext);
  const state = useMemo(
    () =>
      agents
        .map((e) => ({
          key: e,
          webId: e,
          name: nameRecord[e] ?? e,
        }))
        .filter(
          (agent) =>
            !searchString ||
            agent.key.toLowerCase().includes(searchString.toLowerCase()) ||
            agent.name.toLowerCase().includes(searchString.toLowerCase()),
        ),
    [agents, nameRecord, searchString],
  );
  const { orderedData, sortBy, inverted } = useOrdered(headings, state);
  return (
    <div className={styles["table-container"]}>
      <Table className={styles["table-style"]}>
        <Thead headings={headings} inverted={inverted} onSort={sortBy} />
        <tbody data-testid="table-body">
          {orderedData.map(({ key }) => (
            <tr
              key={key}
              className={styles.row}
              onClick={() => {
                onDetails(key);
              }}
              data-testid={`agent-row[${key}]`}
            >
              <td aria-label={`Icon for ${nameRecord[key] ?? key}`}>
                <DisplayImage url={key} fallback />
              </td>
              <td className={styles["table-entry"]} data-testid="agent-name">
                <DisplayAgent url={key} />
              </td>
              <td className={styles["table-entry"]}>{key}</td>
              <td>
                <DetailsIcon />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default function ListAgents({
  agents,
  onDetails,
  searchString,
}: {
  agents: string[];
  searchString?: string;
  onDetails: (_agent: string) => void;
}) {
  if (agents.length === 0) {
    return <EmptyAgentPage />;
  }
  return (
    <>
      <b data-testid="agent-list-header">
        Organizations, Apps and Companies with Granted Access
      </b>
      <br />
      <br />
      <AgentTable
        agents={agents}
        onDetails={onDetails}
        searchString={searchString}
      />
    </>
  );
}
