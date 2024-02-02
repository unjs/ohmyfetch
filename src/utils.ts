import type { FetchContext, FetchOptions, Interceptor, InterceptorFn, OmitInterceptors, ResponseType } from "./types";

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
export function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}

export function isJSONSerializable(value: any) {
  if (value === undefined) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false; // bigint, function, symbol, undefined
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return (
    (value.constructor && value.constructor.name === "Object") ||
    typeof value.toJSON === "function"
  );
}

const textTypes = new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html",
]);

const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;

// This provides reasonable defaults for the correct parser based on Content-Type header.
export function detectResponseType(_contentType = ""): ResponseType {
  if (!_contentType) {
    return "json";
  }

  // Value might look like: `application/json; charset=utf-8`
  const contentType = _contentType.split(";").shift() || "";

  if (JSON_RE.test(contentType)) {
    return "json";
  }

  // TODO
  // if (contentType === 'application/octet-stream') {
  //   return 'stream'
  // }

  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }

  return "blob";
}

// Merging of fetch option objects.
export function mergeFetchOptions(
  input: OmitInterceptors<FetchOptions> | undefined,
  defaults: OmitInterceptors<FetchOptions> | undefined,
  Headers = globalThis.Headers
): FetchOptions {
  const merged: FetchOptions = {
    ...defaults,
    ...input,
  };

  // Merge params and query
  if (defaults?.params && input?.params) {
    merged.params = {
      ...defaults?.params,
      ...input?.params,
    };
  }
  if (defaults?.query && input?.query) {
    merged.query = {
      ...defaults?.query,
      ...input?.query,
    };
  }

  // Merge headers
  if (defaults?.headers && input?.headers) {
    merged.headers = new Headers(defaults?.headers || {});
    for (const [key, value] of new Headers(input?.headers || {})) {
      merged.headers.set(key, value);
    }
  }

  return merged;
}

export async function callInterceptors(
  ctx: FetchContext,
  cb?: InterceptorFn<any>,
  globalCb?: Interceptor<any>,
  data?: any
) {
  if (typeof globalCb === "object") {
    const { strategy, handler } = globalCb

    if (!cb || strategy === "manual") { 
      return handler(ctx, data) 
    }
    if (strategy === "before") { 
      return handler(ctx, await cb(ctx, data)) 
    }
    if (strategy === "after") { 
      return cb(ctx, await handler(ctx, data)) 
    }
  }

  return cb ? cb(ctx, data) : (globalCb ? (globalCb as InterceptorFn<any>)(ctx, data) : data)
}
