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
interface Crumb {
  category?: string;
  to: string;
  from: string;
}
interface SentryEvent {
  breadcrumbs: Crumb[];
}

function hasBreadcrumbs(sentryEvent: { breadcrumbs: Crumb[] | Crumb[] }) {
  return !!(
    sentryEvent &&
    sentryEvent?.breadcrumbs &&
    sentryEvent?.breadcrumbs?.length
  );
}

export function redactCodeParameter(string: string) {
  return string.replace(/([?&])(code=[^&]+)/, "$1code=[REDACTED]");
}

function redactBreadcrumbs(crumbs: Crumb[]) {
  return crumbs.map((crumb) => {
    if (crumb.category !== "navigation") {
      return crumb;
    }

    if (crumb.from) {
      Object.assign(crumb, { from: redactCodeParameter(crumb.from) });
    }

    if (crumb.to) {
      Object.assign(crumb, { to: redactCodeParameter(crumb.to) });
    }
    return crumb;
  }, []);
}

export function filterSentryEvent(sentryEvent: SentryEvent) {
  if (!hasBreadcrumbs(sentryEvent)) {
    return sentryEvent;
  }

  const breadcrumbs = redactBreadcrumbs(sentryEvent.breadcrumbs);

  return { ...sentryEvent, breadcrumbs };
}

export default { filterSentryEvent };
