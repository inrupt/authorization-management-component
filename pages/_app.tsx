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
import "../scss/custom.scss";

import Head from "next/head";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import AuthenticationProvider from "../src/authentication/context/AuthenticationProvider";
import Footer from "../src/components/Footer/Footer";
import Header from "../src/components/Header/Header";
import SessionProvider from "../src/session/SessionProvider";
import WorkerProvider from "../src/session/WorkerProvider";

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  useEffect(() => {
    // the dropdown component requires this specific import to work
    // it needs to be done here so that document is defined

    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(console.error);
  }, []);

  return (
    <WorkerProvider>
      <SessionProvider restorePreviousSession>
        <AuthenticationProvider>
          <>
            <Head>
              <title>AMC</title>
              <meta
                name="description"
                content="An Authorization Management Component"
              />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            {!["/login", "/", "/resources"].includes(pathname) && <Header />}
            <Component {...pageProps} />
            {pathname === "/login" && <Footer />}
          </>
        </AuthenticationProvider>
      </SessionProvider>
    </WorkerProvider>
  );
}

export default App;
