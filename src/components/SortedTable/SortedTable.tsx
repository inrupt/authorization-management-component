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

import type { Dispatch } from "react";
import { useCallback } from "react";
import type { HeaderData } from "../../hooks/useOrdered";
import styles from "./SortedTable.module.scss";

function Th<T extends string, V>({
  keyVal: key,
  name,
  inverted,
  onSort,
  sortBy,
  hidden,
}: {
  sortBy?: ((_a: V, _b: V) => number) | undefined;
  keyVal: T;
  name: string;
  inverted: boolean;
  onSort: Dispatch<T>;
  hidden: boolean;
}) {
  const onClick = useCallback(() => onSort(key), [onSort, key]);
  return (
    <th key={key} data-testid={`table-heading-sort-${key}`}>
      {hidden ? <span className="visually-hidden">{name}</span> : name}
      {typeof sortBy === "function" && (
        <i
          className={`bi bi-sort-${inverted ? "up" : "down"} ${
            styles["sort-icon"]
          }`}
          onClick={onClick}
          onKeyDown={onClick}
          role="button"
          tabIndex={0}
          title={`Sort by ${key}`}
          aria-label={`Sort by ${key}`}
          data-testid={`table-heading-sort-icon-${key}`}
        />
      )}
    </th>
  );
}

export function Thead<T extends string, V>({
  headings,
  inverted,
  onSort,
}: {
  headings: HeaderData<T, V>[];
  inverted: Record<T, boolean>;
  onSort: Dispatch<T>;
}) {
  return (
    <thead>
      <tr>
        {headings.map(({ key, name, sortBy, hidden }) => (
          <Th
            key={key}
            keyVal={key}
            name={name}
            sortBy={sortBy}
            inverted={inverted[key]}
            onSort={onSort}
            hidden={!!hidden}
          />
        ))}
      </tr>
    </thead>
  );
}

export function DetailsIcon({ onClick }: { onClick?: () => void | undefined }) {
  return (
    <i
      className={`bi bi-info-circle ${styles["details-icon"]}`}
      onClick={onClick}
      onKeyDown={onClick}
      role="button"
      tabIndex={0}
      data-testid="details-icon"
      title="Open Resource Details"
    />
  );
}
