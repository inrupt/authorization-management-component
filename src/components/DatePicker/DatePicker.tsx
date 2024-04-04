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
import { useRef } from "react";
import styles from "./DatePicker.module.scss";
import Button from "../Button/Button";
import { getCurrentDate } from "./getCurrentDate";

export const durationItems = {
  "1 Day": () => {
    const date = getCurrentDate();
    return new Date(date.setDate(date.getDate() + 1));
  },
  "1 Month": () => {
    const date = getCurrentDate();
    return new Date(date.setMonth(date.getMonth() + 1));
  },
  "1 Year": () => {
    const date = getCurrentDate();
    return new Date(date.setFullYear(date.getFullYear() + 1));
  },
  "3 Months": () => {
    const date = getCurrentDate();
    return new Date(date.setMonth(date.getMonth() + 3));
  },
  "6 Months": () => {
    const date = getCurrentDate();
    return new Date(date.setMonth(date.getMonth() + 6));
  },
  Forever: () => undefined,
} as const;

export type DateValue =
  | {
      type: "Duration";
      value: keyof typeof durationItems;
    }
  | {
      type: "Date";
      value: Date;
    };

interface Props {
  expirationDate: DateValue;
  setExpirationDate: (_date: DateValue) => void;
  requestedExpirationDate: Date | undefined;
}

export default function DatePicker({
  setExpirationDate,
  expirationDate,
  requestedExpirationDate,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const calendarToggle = (
    <div className={styles["picker-input-container"]}>
      <input
        type="date"
        max={requestedExpirationDate?.toISOString().split("T")[0]}
        className={styles["picker-input"]}
        value={
          expirationDate.type === "Date"
            ? expirationDate.value.valueOf()
            : Date.now()
        }
        ref={inputRef}
        onClick={() => {
          inputRef?.current?.showPicker();
        }}
        onChange={(e) => {
          setExpirationDate({
            type: "Date",
            value: new Date(e.target.value),
          });
        }}
      />
      <Button variant="text">
        <i className={`bi bi-calendar-fill ${styles.icon}`} />
      </Button>
    </div>
  );

  const isDisabled = (
    type: "Duration" | "Date",
    value: string | Date
  ): boolean => {
    if (
      (requestedExpirationDate && value === "Forever") ||
      requestedExpirationDate === undefined
    ) {
      return true;
    }
    if (type === "Duration") {
      const expirationDateValue =
        durationItems[value as keyof typeof durationItems]();
      if (expirationDateValue === undefined) {
        return true;
      }
      return expirationDateValue > new Date(requestedExpirationDate);
    }
    return new Date(value) > new Date(requestedExpirationDate);
  };

  const durationList = (
    <ul className={styles["duration-list"]}>
      {Object.keys(durationItems).map((label) => {
        return (
          <li key={`${label.replace(" ", "-")}-list-item`}>
            <Button
              variant="small"
              className={styles["duration-list-item"]}
              type="button"
              onClick={() => {
                setExpirationDate({
                  type: "Duration",
                  value: label as keyof typeof durationItems,
                });
              }}
              disabled={isDisabled("Duration", label)}
            >
              {label}
            </Button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={styles["date-picker-container"]}>
      <Button
        className={styles["date-picker-toggle"]}
        variant="outline"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        data-testid="date-picker-toggle"
        type="button"
        aria-expanded="false"
      >
        {expirationDate.type === "Date"
          ? expirationDate.value.toDateString()
          : expirationDate.value}
        <i
          className={`${
            expirationDate.type === "Date"
              ? `bi bi-calendar-fill`
              : `bi bi-clock-fill`
          } ${styles.icon}`}
        />
      </Button>
      <div className="dropdown">
        <div className="dropdown-menu">
          {durationList}

          <hr className="dropdown-divider" />

          <li className={styles["icon-toggle"]}>{calendarToggle}</li>
        </div>
      </div>
    </div>
  );
}
