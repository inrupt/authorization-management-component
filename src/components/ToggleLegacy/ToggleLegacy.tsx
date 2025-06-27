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

import styles from "./ToggleLegacy.module.scss";
import Info from "../Info/Info";

export interface Props {
  toggleDescription: string;
  toggleValue: boolean;
  toggleLegacy: () => void;
}

export default function ToggleLegacy({
  toggleDescription,
  toggleValue,
  toggleLegacy,
}: Props) {
  return (
    <div className={styles["legacy-description"]}>
      Select if your Pod needs Legacy support:
      <div className={styles["legacy-checkbox"]}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={toggleValue}
          onChange={() => toggleLegacy()}
          aria-label="checkbox-toggle"
          aria-labelledby="toggle-legacy-label"
          data-testid="toggle-legacy"
        />{" "}
        <>
          {"Legacy support"}
          <Info>
            <b>Legacy support: </b>
            {toggleDescription}
          </Info>
        </>
      </div>
    </div>
  );
}
