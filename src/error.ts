import type { FetchContext, IFetchError } from "./types";

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class FetchError<T = any> extends Error implements IFetchError<T> {
  constructor(message: string, opts?: { cause: unknown }) {
    // @ts-ignore https://v8.dev/features/error-cause
    super(message, opts);

    this.name = "FetchError";

    // Polyfill cause for other runtimes
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}

// Augment `FetchError` type to include `IFetchError` properties
export interface FetchError<T = any> extends IFetchError<T> {}

export function createFetchError<T = any>(
  ctx: FetchContext<T>
): IFetchError<T> {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";

  const method =
    (ctx.request as Request)?.method || ctx.options?.method || "GET";
  const url = (ctx.request as Request)?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;

  const statusStr = ctx.response
    ? `${ctx.response.status}${
        ctx.response.statusText ? ` ${ctx.response.statusText}` : ""
      }`
    : "<no response>";

  const message = `${requestStr}: ${statusStr}${
    errorMessage ? ` ${errorMessage}` : ""
  }`;

  const fetchError: FetchError<T> = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : undefined
  );

  for (const key of ["request", "options", "response"] as const) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      },
    });
  }

  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"],
  ] as const) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      },
    });
  }

  return fetchError;
}
