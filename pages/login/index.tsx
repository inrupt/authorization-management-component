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

import type { ReactElement } from "react";
import React, { useCallback, useContext, useState } from "react";
import Head from "next/head";
import Button from "../../src/components/Button/Button";
import styles from "./LoginPage.module.scss";
import IDPS from "../../src/constants/provider";
import AMC_CURRENT_OP from "../../src/constants/currentOP";
import { SessionContext } from "../../src/session/SessionProvider";
import useReturnUrl from "../../src/authentication/hooks/useReturnUrl";
import AutocompleteForm from "../../src/components/Forms/AutocompleteForm/AutocompleteForm";
import { generateRedirectUrl } from "../../src/helpers/window/window";

const DEFAULT_PROVIDER_IRI = "https://login.inrupt.com";
const LABEL = "What is your identity provider?";
const FIELD = "provider";

export default function LoginPage(): ReactElement {
  const [isDropdownExpanded, setIsDropdownExpanded] = useState(false);

  const { persist } = useReturnUrl();
  const { login: sessionLogin } = useContext(SessionContext);
  const publicClientIdDoc =
    window.location.hostname === "localhost"
      ? "https://storage.inrupt.com/87048fc7-b553-4c86-95de-633e1675f0bd/AMI/clientid.jsonld"
      : `https://${window.location.hostname}/api/app`;

  const login = useCallback(
    (oidcIssuer: string) => {
      persist();
      return sessionLogin({
        oidcIssuer,
        clientName: "Inrupt AMI",
        clientId: publicClientIdDoc,
        // TODO: Improve redirect url to be something specific:
        redirectUrl: generateRedirectUrl(""),
      });
    },
    [persist, sessionLogin, publicClientIdDoc],
  );

  const handleDefaultLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Saving the current OpenID Provider (OP) in local storage allows to keep track of it after redirects in the login flow.
    // It is used to provide more specific directions to users logged into a known OP when applicable.
    // For instance, it is used when users' WebID is not dereferencable, which may be fixed by visiting
    // the `start` service co-located with their OP.
    window.localStorage.setItem(AMC_CURRENT_OP, DEFAULT_PROVIDER_IRI);
    return login(DEFAULT_PROVIDER_IRI);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>, idp: string) => {
    e.preventDefault();
    window.localStorage.setItem(AMC_CURRENT_OP, idp);
    return login(idp);
  };

  const toggleDropdown = () => {
    setIsDropdownExpanded(!isDropdownExpanded);
  };

  return (
    <>
      <Head>
        <title>Login to AMC</title>
        <meta
          name="description"
          content="Login to Authorization Management Component"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <img
          alt="Inrupt logo"
          src="/inrupt_logo-2020.svg"
          width={200}
          height={60}
          className={styles.logo}
        />
        <h1>Authorization Management Component</h1>
        <p>View and manage data in your Pod</p>
        <section className={styles.container}>
          <h2>Connect with</h2>
          <img
            width={160}
            height={80}
            src="/pod-spaces-logo.svg"
            alt="Inrupt PodSpaces logo"
            className=""
          />
          <form>
            <Button
              data-testid="connect-to-pod"
              variant="primary"
              onClick={handleDefaultLogin}
            >
              Connect to Pod
            </Button>
          </form>
          <Button
            variant="outline"
            onClick={toggleDropdown}
            className={styles["advanced-toggle"]}
            data-testid="advanced-login"
          >
            Advanced
            {isDropdownExpanded ? (
              <i className="bi bi-caret-up-fill" title="Expand" />
            ) : (
              <i className="bi bi-caret-down-fill" title="Collapse" />
            )}
          </Button>
          {isDropdownExpanded && (
            <AutocompleteForm
              onSubmit={handleLogin}
              options={IDPS}
              label={LABEL}
              field={FIELD}
            />
          )}
        </section>
        <section className={styles["sign-up"]}>
          {" "}
          Need a Pod?{" "}
          <a
            href="https://start.inrupt.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sign up
          </a>
        </section>
      </main>
    </>
  );
}
