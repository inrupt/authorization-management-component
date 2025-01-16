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
import { useEffect, useState } from "react";
import styles from "./ListResources.module.scss";
import FileIcon from "../FileIcon/FileIcon";

export interface Props {
  key: string;
  type: "Resource" | "Container";
  name: string;
  contains: () => Promise<Props[]>;
  depth?: number;
  icon?: boolean;
  resourceIri: string;
}

export default function ListResources({
  depth: tempDepth = 0,
  type,
  name,
  icon = true,
  resourceIri,
  contains,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [expandAttempted, setExpandAttempted] = useState(false);
  const [containedResources, setContainedResources] = useState<false | Props[]>(
    false
  );
  const depth = tempDepth ?? 0;

  useEffect(() => {
    if (expandAttempted) {
      contains()
        .then((res) => {
          setContainedResources(res);
        })
        .catch(() => {
          setExpanded(false);
          setExpandAttempted(false);
        });
    }
  }, [expandAttempted, contains]);

  const onClick = () => {
    setExpanded(!expanded);
    if (!expanded && !expandAttempted) setExpandAttempted(true);
  };

  return (
    <>
      <div className={styles["resource-div"]}>
        <div
          className={styles["adjacent-icon"]}
          style={{
            marginLeft: icon ? 25 * depth : 0,
            paddingRight: icon ? 6 : 0,
          }}
        >
          {icon && <FileIcon expanded={expanded} resourceIri={resourceIri} />}
        </div>
        <div className={styles["name-content"]}>{name}</div>
        {type === "Container" &&
          (expanded && !containedResources ? (
            <div
              className={`spinner-border ${styles.loader}`}
              role="button"
              onClick={onClick}
              onKeyDown={onClick}
              tabIndex={0}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <i
              className={`bi bi-chevron-${expanded ? "down" : "right"} ${
                styles["chevron-icon"]
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              onKeyDown={onClick}
              role="button"
              tabIndex={0}
              title={expanded ? "collapse" : "expand"}
            />
          ))}
      </div>

      {expanded &&
        containedResources &&
        containedResources.map((prop) => {
          return (
            <ListResources
              {...prop}
              depth={icon ? depth + 1 : depth}
              key={prop.key}
            />
          );
        })}
    </>
  );
}
