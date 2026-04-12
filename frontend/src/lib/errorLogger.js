import { http } from "./http";

const isDev = import.meta.env.DEV;

class ErrorLogger {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  async log(error, context = {}) {
    // Log to console in development
    if (isDev) {
      console.error("[ErrorLogger]", error, context);
    }

    // Send to backend in production
    if (!isDev) {
      const errorData = {
        message: error?.message || String(error),
        stack: error?.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      this.queue.push(errorData);

      if (!this.isProcessing) {
        this.processQueue();
      }
    }
  }

  async processQueue() {
    if (this.queue.length === 0) return;

    this.isProcessing = true;

    try {
      const batch = this.queue.splice(0, 10); // Send max 10 at a time
      await http.post("/error-logs", { errors: batch }).catch(() => {
        // Silently fail - don't want error logging to break the app
      });
    } finally {
      this.isProcessing = false;

      if (this.queue.length > 0) {
        // Process remaining errors
        setTimeout(() => this.processQueue(), 5000);
      }
    }
  }

  logException(error, context) {
    this.log(error, { ...context, type: "exception" });
  }

  logApiError(error, context) {
    this.log(error, { ...context, type: "api_error" });
  }

  logValidationError(error, context) {
    this.log(error, { ...context, type: "validation_error" });
  }
}

export const errorLogger = new ErrorLogger();

// Global error handler for unhandled exceptions
if (!isDev) {
  window.addEventListener("error", (event) => {
    errorLogger.logException(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    errorLogger.logException(event.reason, {
      type: "unhandled_rejection",
    });
  });
}
