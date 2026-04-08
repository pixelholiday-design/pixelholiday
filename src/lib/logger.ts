/**
 * Minimal structured logger.
 *
 * Outputs JSON lines so a future drop-in (Sentry, Logtail, Datadog) can
 * pick them up unchanged. Replace `emit()` with the SDK call when ready.
 */
type Level = "info" | "warn" | "error";

function emit(level: Level, scope: string, payload: unknown) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    scope,
    payload: serialize(payload),
  });
  // Keep `console.error` for fail-fast crashes; rest writes through console
  // so Vercel/Vault log drains pick it up automatically.
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (process.env.NODE_ENV !== "production") console.log(line);
}

function serialize(p: unknown) {
  if (p instanceof Error) return { name: p.name, message: p.message, stack: p.stack };
  return p;
}

export const logger = {
  info: (scope: string, payload?: unknown) => emit("info", scope, payload),
  warn: (scope: string, payload?: unknown) => emit("warn", scope, payload),
  error: (scope: string, payload?: unknown) => emit("error", scope, payload),
};
