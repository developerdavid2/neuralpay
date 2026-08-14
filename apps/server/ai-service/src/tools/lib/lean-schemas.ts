import { z } from "zod";

// Lean input schemas for tool args.
//
// `z.string().uuid()` / `z.string().datetime()` emit giant regex `pattern`
// strings in the JSON schema that gets sent to the model on every request
// (Groq free tier caps at 8000 TPM — the tool definitions are the largest
// token cost). These validate identically at runtime but serialize to a
// plain `{"type":"string"}` in JSON schema, keeping the request small.

const UUID_RE =
  /^(?:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;

/** UUID string validated at runtime; emits no `pattern` in JSON schema. */
export const uuidInput = () =>
  z.string().refine((v) => UUID_RE.test(v), "Expected a valid UUID");

/**
 * Datetime (ISO string) validated at runtime; accepts full ISO datetimes and
 * date-only strings; emits no `pattern` in JSON schema.
 */
export const datetimeInput = () =>
  z
    .string()
    .refine(
      (v) => !Number.isNaN(Date.parse(v)) && /\d/.test(v),
      "Expected a valid ISO datetime",
    );
