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
import { useEffect, useMemo, useReducer } from "react";

export interface HeaderData<T, V> {
  key: T;
  name: string;
  sortBy?(_a: V, _b: V): number;
  hidden?: boolean;
}

export interface OrderState<T extends string, V, R extends Record<T, V>> {
  order: T[];
  inverted: Record<T, boolean>;
  orderHelpers: Record<T, HeaderData<T, V>>;
  orderedData: R[];
}

function sortData<T extends string, V, R extends Record<T, V>>(
  data: R[],
  order: T[],
  helpers: Record<T, HeaderData<T, V>>,
  inverted: Record<T, boolean>
) {
  return data.sort((a, b) => {
    for (const key of order) {
      const sort = helpers[key].sortBy!(a[key], b[key]);
      if (sort !== 0) return inverted[key] ? -sort : sort;
    }
    return 0;
  });
}

function orderReducer<T extends string, V, R extends Record<T, V>>(
  state: OrderState<T, V, R>,
  key: T | R[]
): OrderState<T, V, R> {
  let { inverted, order, orderedData } = state;
  if (typeof key === "string") {
    inverted = {
      ...state.inverted,
      [key]: state.order[0] === key && !state.inverted[key],
    };
    order = [key, ...state.order.filter((elem) => elem !== key)];
  } else {
    orderedData = key;
  }

  return {
    inverted,
    order,
    orderHelpers: state.orderHelpers,
    orderedData: sortData(orderedData, order, state.orderHelpers, inverted),
  };
}

function init<T extends string, V, R extends Record<T, V>>({
  headings,
  data,
}: {
  headings: HeaderData<T, V>[];
  data: R[];
}): OrderState<T, V, R> {
  const order = headings.flatMap((heading) =>
    "sortBy" in heading ? heading.key : []
  );
  const inverted = Object.fromEntries(order.map((o) => [o, false])) as Record<
    T,
    boolean
  >;
  const orderHelpers = Object.fromEntries(
    headings.map((heading) => [heading.key, heading])
  ) as Record<T, HeaderData<T, V>>;
  return {
    order,
    inverted,
    orderHelpers,
    orderedData: sortData(data, order, orderHelpers, inverted),
  };
}

export function useOrdered<T extends string, V, R extends Record<T, V>>(
  headings: HeaderData<T, V>[],
  data: R[]
) {
  // The use of [any] below is not ideal but the change from React 18 to 19 included a significant change to the useReducer
  // interface and this was sufficient to get this working. We can revisit this later if we want to be more type-specific.
  const [{ orderedData, inverted }, sortBy] = useReducer<
    OrderState<T, V, R>,
    { headings: HeaderData<T, V>[]; data: R[] },
    [any]
  >(orderReducer, { headings, data }, init);
  const ret = useMemo(
    () => ({ orderedData, sortBy, inverted }),
    [orderedData, sortBy, inverted]
  );

  useEffect(() => {
    sortBy(data);
  }, [data]);

  return ret;
}

export function comp<T>(a: T, b: T) {
  // eslint-disable-next-line no-nested-ternary
  return a === b ? 0 : a > b ? 1 : -1;
}
