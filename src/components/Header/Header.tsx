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

import Image from "next/image";
import { useContext } from "react";
import Link from "next/link";
import logo from "../../../public/inrupt_logo-2020.svg";
import { SessionContext } from "../../session/SessionProvider";
import Button from "../Button/Button";
import styles from "./Header.module.scss";

export default function Header({
  children,
}: {
  children?: JSX.Element | JSX.Element[] | undefined;
}) {
  const { logout, session } = useContext(SessionContext);

  const isUrl = (candidateUrl: string | URL) => {
    try {
      // If url is not URL-shaped, this will throw.
      // eslint-disable-next-line no-new
      new URL(candidateUrl);
      return true;
    } catch (_e) {
      return false;
    }
  };

  const handleLogout = async () => {
    if (
      session.info.clientAppId !== undefined &&
      isUrl(session.info.clientAppId)
    ) {
      await logout({
        logoutType: "idp",
        postLogoutUrl: new URL("/", window.location.href).toString(),
      });
    } else {
      await logout({ logoutType: "app" });
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles["header-top"]}>
        <Link href="/">
          <Image src={logo} alt="Inrupt logo" className={styles.logo} />
        </Link>
        {session.info.isLoggedIn && (
          <Button
            variant="text"
            data-testid="logout-button"
            onClick={() => handleLogout()}
            className={styles["logout-button"]}
          >
            Logout
          </Button>
        )}
      </div>
      {children && <div className={styles["header-bottom"]}>{children}</div>}
    </header>
  );
}

Header.defaultProps = {
  children: undefined,
};
