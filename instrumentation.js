import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: SENTRY_DSN,
    });
  }

  // In case the edge runtime is used:
  // 1. Create a sentry.edge.config file
  // 2. Uncomment the following lines
  //   if (process.env.NEXT_RUNTIME === "edge") {
  //     Sentry.init({
  //       dsn: SENTRY_DSN,
  //     });
  //   }
}
