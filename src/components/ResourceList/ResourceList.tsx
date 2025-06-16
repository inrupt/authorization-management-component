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

import { useCallback, useState } from "react";
import { Table } from "reactstrap";
import type { DatasetWithId } from "@inrupt/solid-client-access-grants";
import type { HeaderData } from "../../hooks/useOrdered";
import { comp, useOrdered } from "../../hooks/useOrdered";
import type { Props as ResourceDetailsBase } from "../ListResources/ListResources";
import ListResources from "../ListResources/ListResources";
import { DetailsIcon, Thead } from "../SortedTable/SortedTable";
import styles from "../SortedTable/SortedTable.module.scss";
import type { Access } from "./permissionDescription";
import { permissionDescription } from "./permissionDescription";
import RevokeButton from "../RevokeButton/RevokeButton";
import FileIcon from "../FileIcon/FileIcon";
import GrantActions from "../GrantActions/GrantActions";

export interface ResourceDetails extends ResourceDetailsBase {
  expiry?: Date;
  access: Access;
}

export interface ResourceDetailsWithProvenance extends ResourceDetails {
  grants: DatasetWithId[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const accessHeaders: HeaderData<string, any>[] = [
  {
    key: "type",
    name: "File Type",
    hidden: true,
  },
  {
    key: "name",
    name: "Name",
    sortBy: (a: string, b: string) => comp(a, b),
  },
  {
    key: "access",
    name: "Access",
    sortBy: (a: Access, b: Access) =>
      comp(permissionDescription(a), permissionDescription(b)),
  },
  {
    key: "expiry",
    name: "Expiry Date",
    sortBy: comp,
  },
  {
    key: "key",
    name: "Resource Details",
  },
  {
    key: "actions",
    name: "Actions",
  },
];

function DisplayResource({
  resource,
  onDetails,
  agent,
  onRevoke,
}: {
  resource: ResourceDetailsWithProvenance;
  onDetails: (_name: ResourceDetailsWithProvenance) => void;
  agent: string;
  onRevoke: () => void;
}) {
  const onClick = useCallback(() => onDetails(resource), [onDetails, resource]);
  const [actionClicked, setActionClicked] = useState<boolean>(false);
  return (
    <tr
      key={resource.key}
      className={styles.row}
      onClick={onClick}
      data-testid={`resource-row-agent[${agent}]-resource[${resource.key}]`}
    >
      <th
        aria-label={resource.type === "Resource" ? "File Icon" : "Folder Icon"}
      >
        <FileIcon resourceIri={resource.key} />
      </th>
      <th>
        <ListResources
          key={resource.key}
          resourceIri={resource.resourceIri}
          name={resource.name}
          contains={resource.contains}
          type={resource.type}
          icon={false}
        />
      </th>
      <th>{permissionDescription(resource.access)}</th>
      <th>{resource.expiry?.toDateString() ?? "Forever"}</th>
      <th>
        <DetailsIcon />
      </th>
      <th
        onClick={(e) => {
          // Prevents row-level onclick to apply to cell.
          e.stopPropagation();
        }}
      >
        <GrantActions
          testidSuffix={resource.name}
          actionClicked={actionClicked}
          setActionClicked={setActionClicked}
          isSidebar={false}
        >
          <RevokeButton
            name={resource.name}
            agent={agent}
            grants={resource.grants}
            onRevoke={onRevoke}
            onClick={() => {
              setActionClicked(true);
            }}
            variant="outline-clear"
          />
        </GrantActions>
      </th>
    </tr>
  );
}

export default function ResourceList({
  data,
  onDetails,
  agent,
  onRevoke,
}: {
  data: ResourceDetailsWithProvenance[];
  onDetails: (_key: ResourceDetailsWithProvenance) => void;
  agent: string;
  onRevoke: () => void;
}) {
  const { orderedData, sortBy, inverted } = useOrdered(accessHeaders, data);
  return (
    <div className={styles["table-container"]}>
      <Table className={styles["table-style"]}>
        <Thead headings={accessHeaders} inverted={inverted} onSort={sortBy} />
        <tbody>
          {orderedData.map((resource) => (
            <DisplayResource
              key={resource.key}
              resource={resource}
              onDetails={onDetails}
              agent={agent}
              onRevoke={onRevoke}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
}
