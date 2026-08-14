/** Runtime output-contract hardening: drop any key not in the allowlist. */
export function stripFields<T extends Record<string, unknown>>(
  rows: T[],
  allowed: readonly string[],
): Partial<T>[] {
  const allowedSet = new Set(allowed);
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(row)) {
      if (allowedSet.has(key)) out[key] = row[key];
    }
    return out as Partial<T>;
  });
}
