/**
 * Structured logger for server-side code.
 *
 * Outputs JSON lines — compatible with any log aggregator
 * (Vercel, Docker, Datadog, Grafana Loki, CloudWatch, etc.)
 *
 * Usage:
 *   import { log } from "@/app/lib/logger";
 *   log.info("chat.request", { ip, messageCount: 5 });
 *   log.error("chat.stream_failed", { error: err.message });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  event: string;
  ts: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, event: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    event,
    ts: new Date().toISOString(),
    ...data,
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") console.debug(line);
      break;
    default:
      console.log(line);
  }
}

export const log = {
  debug: (event: string, data?: Record<string, unknown>) => emit("debug", event, data),
  info: (event: string, data?: Record<string, unknown>) => emit("info", event, data),
  warn: (event: string, data?: Record<string, unknown>) => emit("warn", event, data),
  error: (event: string, data?: Record<string, unknown>) => emit("error", event, data),
};
