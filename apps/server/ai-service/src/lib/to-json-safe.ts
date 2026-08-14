/**
 * Deep-converts a tool output to a JSON-safe value so it passes the AI SDK's
 * message validation (tool result outputs must be plain JSON: null, string,
 * number, boolean, array, or record). Drizzle/Neon returns JS Date instances
 * for timestamp columns, which zod rejects as "received Date".
 */
export function toJsonSafe<T>(value: T): T {
  if (value instanceof Date) {
    return value.toISOString() as T;
  }
  if (Array.isArray(value)) {
    return value.map(toJsonSafe) as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val === undefined) continue;
      out[key] = toJsonSafe(val);
    }
    return out as T;
  }
  return value;
}
