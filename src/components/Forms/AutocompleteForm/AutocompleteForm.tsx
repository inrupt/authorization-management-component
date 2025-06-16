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

import React, { useState } from "react";
import {
  TESTID_LOGIN_BUTTON,
  TESTID_OPENID_PROVIDER_INPUT,
} from "@inrupt/internal-playwright-testids";
import Button from "../../Button/Button";
import styles from "./AutocompleteForm.module.scss";

interface IAutocompleteForm {
  onSubmit: (_e: React.FormEvent<HTMLFormElement>, _idp: string) => void;
  options: { label: string; value: string }[];
  label: string;
  field: string;
}

export default function AutocompleteForm({
  onSubmit,
  options,
  label,
  field,
}: IAutocompleteForm) {
  const [formValue, setFormValue] = useState("");

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue(e.target.value);
  };
  return (
    <form
      autoComplete={options.length ? "off" : "on"}
      className={styles.form}
      onSubmit={(e) => onSubmit(e, formValue)}
    >
      <div className="form-group">
        <label htmlFor={field}>
          {label}
          <input
            className="form-control"
            value={formValue}
            onChange={onInputChange}
            type="text"
            id={field}
            name={field}
            data-testid={TESTID_OPENID_PROVIDER_INPUT}
            list="options-list"
          />
        </label>
        {options.length && (
          <datalist id="options-list">
            {options.map((option) => {
              return (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </datalist>
        )}
      </div>
      <Button data-testid={TESTID_LOGIN_BUTTON} variant="primary" type="submit">
        Go
      </Button>
    </form>
  );
}
