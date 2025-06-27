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

import Head from "next/head";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import { useState } from "react";
import Button from "../src/components/Button/Button";
import styles from "./Home.module.scss";

const REQUEST_VC_URL_PARAM_NAME = "requestVcUrl";
const REDIRECT_URL_PARAM_NAME = "redirectUrl";

function Home(): ReactElement {
  const { replace } = useRouter();

  const [url, setUrl] = useState("");
  const [postLogout, setPostLogout] = useState("");

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
        THIS IS A TEMPORARY PAGE IN PLACE OF AN ACTUAL APPLICATION GENERATING
        THE REDIRECT URL
        <br />
        <br />
        <div>
          Access Grant URL:{" "}
          <input value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div>
          Post Redirect URL:{" "}
          <input
            value={postLogout}
            onChange={(e) => setPostLogout(e.target.value)}
          />
        </div>
        <div>
          <Button
            onClick={() =>
              replace({
                pathname: "/approve",
                query: {
                  [REQUEST_VC_URL_PARAM_NAME]: url,
                  [REDIRECT_URL_PARAM_NAME]: postLogout,
                },
              })
            }
          >
            Submit
          </Button>
        </div>
      </main>
    </div>
  );
}

export default Home;
