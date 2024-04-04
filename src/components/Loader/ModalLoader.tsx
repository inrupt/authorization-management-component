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
import { Modal } from "reactstrap";
import Loader from "./Loader";
import styles from "./Loader.module.scss";

/**
 * Used to block interaction with the screen and display a loading symbol
 */
export default function ModalLoader({ isOpen }: { isOpen: boolean }) {
  const [loaderTimer, setLoaderTimer] = useState<{
    timeout?: ReturnType<typeof setTimeout> | undefined;
    loader: boolean;
  }>({ loader: false });

  useEffect(() => {
    if (isOpen) {
      setLoaderTimer({
        timeout: setTimeout(() => {
          setLoaderTimer({ loader: true });
        }, 1_500),
        loader: false,
      });
    } else {
      clearTimeout(loaderTimer.timeout);
      setLoaderTimer({ loader: false });
    }
    // The linter wants loaderTimer.timeout to be a dependency here.
    // This is not necessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal
      className={styles["custom-modal"]}
      isOpen={isOpen}
      contentClassName={styles["custom-modal-content"]}
      title="loading screen"
      aria-label="loading screen"
      labelledBy="loading-div"
    >
      <Loader hidden={!loaderTimer.loader} />
    </Modal>
  );
}
