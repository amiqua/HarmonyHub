/**
 * Logging utility with support for different log levels
 * Replaces console.log() calls in production
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(name) {
    this.name = name;
    this.minLevel = process.env.NODE_ENV === "production" ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
  }

  _log(level, levelName, ...args) {
    if (level < this.minLevel) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${levelName}] [${this.name}]`;

    if (process.env.NODE_ENV === "development") {
      console[levelName.toLowerCase()]?.(prefix, ...args);
    } else {
      // In production, send to logger service
      console.log(prefix, ...args);
    }
  }

  debug(...args) {
    this._log(LOG_LEVELS.DEBUG, "DEBUG", ...args);
  }

  info(...args) {
    this._log(LOG_LEVELS.INFO, "INFO", ...args);
  }

  warn(...args) {
    this._log(LOG_LEVELS.WARN, "WARN", ...args);
  }

  error(...args) {
    this._log(LOG_LEVELS.ERROR, "ERROR", ...args);
  }
}

/**
 * Create logger instance for a module
 * Usage: const logger = createLogger("ModuleName");
 */
export function createLogger(moduleName) {
  return new Logger(moduleName);
}

/**
 * Global logger for debugging (should be removed before production)
 */
export const globalLogger = createLogger("App");

// ESLint rule: warn on console usage in source code
export const eslintRules = {
  "no-console": [
    "warn",
    {
      allow: ["warn", "error"],
    },
  ],
};
