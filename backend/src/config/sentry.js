/**
 * Sentry Integration for Error Tracking and APM
 * Setup instructions: https://docs.sentry.io/platforms/node/
 * 
 * Add SENTRY_DSN to .env to enable:
 * SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
 */

import * as Sentry from "@sentry/node";
import { env } from "./env.js";
import { logger } from "./logger.js";

export function initSentry(app) {
  if (!env.SENTRY_DSN) {
    logger.warn("Sentry DSN not configured, skipping error tracking setup");
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
  });

  // Attach Sentry middleware to Express
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  logger.info("Sentry initialized for error tracking and APM");
}

export function attachSentryErrorHandler(app) {
  app.use(
    Sentry.Handlers.errorHandler({
      shouldHandleError() {
        return true;
      },
    })
  );
}

export function captureException(err, context = {}) {
  if (env.SENTRY_DSN) {
    Sentry.captureException(err, {
      contexts: { custom: context },
    });
  }
}

export function captureMessage(message, level = "info") {
  if (env.SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
}
