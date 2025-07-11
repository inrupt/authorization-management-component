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

"use client";
import { Input } from "reactstrap";
import { useState } from "react";
import { useRouter } from "next/router";
import ListAgents from "../src/components/ListAgents/ListAgentsWithVCs";
import Header from "../src/components/Header/Header";
import styles from "./Home.module.scss";
import AuthenticatedRoute from "../src/authentication/context/AuthenticatedRoute";

export default function ManagePage() {
  const [value, setValue] = useState("");
  const [disableSearch, setDisableSearch] = useState(true);
  const { push } = useRouter();
  return (
    <AuthenticatedRoute>
      <Header>
        <h1 className={styles.subheader}>Manage Access</h1>
        <div className={styles["search-container"]}>
          <i
            className={`bi bi-search ${styles["search-icon"]}`}
            title="Search"
          />
          <Input
            type="search"
            className={styles["header-input"]}
            placeholder="Search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="agent-search-input"
            disabled={disableSearch}
          />
        </div>
      </Header>
      <main className={styles.main}>
        <div className={styles.pickerContainer}>
          <ListAgents
            onDetails={(agent) =>
              push({
                pathname: "/resources",
                query: { agent },
              })
            }
            searchString={value}
            onAgentUpdate={(agentCount) =>
              agentCount === 0
                ? setDisableSearch(true)
                : setDisableSearch(false)
            }
          />
        </div>
      </main>
    </AuthenticatedRoute>
  );
}
