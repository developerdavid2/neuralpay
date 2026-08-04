// lib/zAsyncIterable.ts
import type { TrackedEnvelope } from "@trpc/server";
import { isTrackedEnvelope, tracked } from "@trpc/server";
import { z } from "zod";

function isAsyncIterable<TValue, TReturn = unknown>(
  value: unknown,
): value is AsyncIterable<TValue, TReturn> {
  return !!value && typeof value === "object" && Symbol.asyncIterator in value;
}

const trackedEnvelopeSchema =
  z.custom<TrackedEnvelope<unknown>>(isTrackedEnvelope);

export function zAsyncIterable<
  TYieldIn,
  TYieldOut,
  TReturnIn = void,
  TReturnOut = void,
  Tracked extends boolean = false,
>(opts: {
  yield: z.ZodType<TYieldOut, TYieldIn>;
  return?: z.ZodType<TReturnOut, TReturnIn>;
  tracked?: Tracked;
}) {
  return z
    .custom<
      AsyncIterable<
        Tracked extends true ? TrackedEnvelope<TYieldIn> : TYieldIn,
        TReturnIn
      >
    >((val) => isAsyncIterable(val))
    .transform(async function* (iter) {
      const iterator = iter[Symbol.asyncIterator]();
      try {
        let next;
        while ((next = await iterator.next()) && !next.done) {
          if (opts.tracked) {
            const [id, data] = trackedEnvelopeSchema.parse(next.value);
            yield tracked(id, await opts.yield.parseAsync(data));
            continue;
          }
          yield opts.yield.parseAsync(next.value);
        }
        if (opts.return) {
          return await opts.return.parseAsync(next.value);
        }
        return;
      } finally {
        await iterator.return?.();
      }
    }) as z.ZodType<
    AsyncIterable<
      Tracked extends true ? TrackedEnvelope<TYieldIn> : TYieldIn,
      TReturnIn,
      unknown
    >,
    AsyncIterable<
      Tracked extends true ? TrackedEnvelope<TYieldOut> : TYieldOut,
      TReturnOut,
      unknown
    >
  >;
}
