// --------------------------
// $fetch API
// --------------------------

// TODO: set default to any for backward compatibility
export interface $Fetch<DefaultT = unknown, A extends object = InternalApi> {
  <
    T = DefaultT,
    ResT extends ResponseType = "json",
    R extends ExtendedFetchRequest<A> = ExtendedFetchRequest<A>,
    M extends
      | ExtractedRouteMethod<A, R>
      | Uppercase<ExtractedRouteMethod<A, R>> =
      | ExtractedRouteMethod<A, R>
      | Uppercase<ExtractedRouteMethod<A, R>>,
  >(
    request: R,
    opts?: FetchOptions<
      ResT,
      {
        method: M;
        query: TypedInternalQuery<R, A, Record<string, any>, Lowercase<M>>;
        body: TypedInternalBody<R, A, any, Lowercase<M>>;
        params: TypedInternalParams<R, A, Record<string, any>, Lowercase<M>>;
      }
    >
  ): Promise<
    MappedResponseType<ResT, TypedInternalResponse<R, A, T, Lowercase<M>>>
  >;
  raw<
    T = DefaultT,
    ResT extends ResponseType = "json",
    R extends ExtendedFetchRequest<A> = ExtendedFetchRequest<A>,
    M extends
      | ExtractedRouteMethod<A, R>
      | Uppercase<ExtractedRouteMethod<A, R>> =
      | ExtractedRouteMethod<A, R>
      | Uppercase<ExtractedRouteMethod<A, R>>,
  >(
    request: R,
    opts?: FetchOptions<
      ResT,
      {
        method: M;
        query: TypedInternalQuery<R, A, Record<string, any>, Lowercase<M>>;
        body: TypedInternalBody<R, A, any, Lowercase<M>>;
        params: TypedInternalParams<R, A, Record<string, any>, Lowercase<M>>;
      }
    >
  ): Promise<
    FetchResponse<
      MappedResponseType<ResT, TypedInternalResponse<R, A, T, Lowercase<M>>>
    >
  >;
  create<T = DefaultT, A extends object = InternalApi>(
    defaults: FetchOptions
  ): $Fetch<T, A>;
  native: Fetch;
}

// --------------------------
// Internal API
// --------------------------

export interface InternalApi {}

// --------------------------
// Context
// --------------------------

export interface FetchContext<
  T = any,
  ResT extends ResponseType = ResponseType,
  // eslint-disable-next-line @typescript-eslint/ban-types
  O extends object = {},
> {
  request: FetchRequest;
  // eslint-disable-next-line no-use-before-define
  options: FetchOptions<ResT, O>;
  response?: FetchResponse<T>;
  error?: Error;
}

// --------------------------
// Options
// --------------------------

export interface FetchOptions<
  ResT extends ResponseType = ResponseType,
  // eslint-disable-next-line @typescript-eslint/ban-types
  O extends object = {},
> extends Omit<RequestInit, "body"> {
  method?: O extends { method: infer M } ? M : RequestInit["method"];
  baseURL?: string;
  body?: O extends { body: infer B }
    ? B
    : RequestInit["body"] | Record<string, any>;
  ignoreResponseError?: boolean;
  params?: O extends { params: infer P } ? P : Record<string, any>;
  query?: O extends { query: infer Q } ? Q : Record<string, any>;
  parseResponse?: (responseText: string) => any;
  responseType?: ResT;

  /**
   * @experimental Set to "half" to enable duplex streaming.
   * Will be automatically set to "half" when using a ReadableStream as body.
   * https://fetch.spec.whatwg.org/#enumdef-requestduplex
   */
  duplex?: "half" | undefined;

  /** timeout in milliseconds */
  timeout?: number;

  retry?: number | false;
  /** Delay between retries in milliseconds. */
  retryDelay?: number;
  /** Default is [408, 409, 425, 429, 500, 502, 503, 504] */
  retryStatusCodes?: number[];

  onRequest?(context: FetchContext<any, ResT, O>): Promise<void> | void;
  onRequestError?(
    context: FetchContext<any, ResT, O> & { error: Error }
  ): Promise<void> | void;
  onResponse?(
    context: FetchContext<any, ResT, O> & { response: FetchResponse<ResT> }
  ): Promise<void> | void;
  onResponseError?(
    context: FetchContext<any, ResT, O> & { response: FetchResponse<ResT> }
  ): Promise<void> | void;
}

export interface CreateFetchOptions {
  // eslint-disable-next-line no-use-before-define
  defaults?: FetchOptions;
  fetch?: Fetch;
  Headers?: typeof Headers;
  AbortController?: typeof AbortController;
}

export type GlobalOptions = Pick<
  FetchOptions,
  "timeout" | "retry" | "retryDelay"
>;

// --------------------------
// Response Types
// --------------------------

export interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}

export type ResponseType = keyof ResponseMap | "json";

export type MappedResponseType<
  ResT extends ResponseType,
  JsonType = any,
> = ResT extends keyof ResponseMap ? ResponseMap[ResT] : JsonType;

export interface FetchResponse<T> extends Response {
  _data?: T;
}

// --------------------------
// Error
// --------------------------

export interface IFetchError<T = any> extends Error {
  request?: FetchRequest;
  options?: FetchOptions;
  response?: FetchResponse<T>;
  data?: T;
  status?: number;
  statusText?: string;
  statusCode?: number;
  statusMessage?: string;
}

// --------------------------
// Other types
// --------------------------

export type Fetch = typeof globalThis.fetch;

export type FetchRequest = RequestInfo;

export type ExtendedFetchRequest<A extends object> =
  | keyof A
  | Exclude<FetchRequest, string>
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export interface SearchParameters {
  [key: string]: any;
}

// --------------------------
// Utility types
// --------------------------

export type HTTPMethod =
  | "GET"
  | "HEAD"
  | "PATCH"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE";

export type RouterMethod = Lowercase<HTTPMethod>;

// An interface to extend in a local project
export type TypedInternalResponse<
  Route,
  A extends object,
  Default = unknown,
  Method extends RouterMethod = RouterMethod,
> = Default extends string | boolean | number | null | void | object
  ? // Allow user overrides
    Default
  : Route extends string
    ? Method extends keyof A[MatchedRoutes<Route, A>]
      ? A[MatchedRoutes<Route, A>][Method] extends { response: infer T }
        ? [T] extends [never]
          ? Default
          : T
        : Default
      : A[MatchedRoutes<Route, A>]["default"] extends { response: infer T }
        ? [T] extends [never]
          ? Default
          : T
        : Default
    : Default;

export type TypedInternalQuery<
  Route,
  A extends object,
  Default,
  Method extends RouterMethod = RouterMethod,
> = Route extends string // TODO: Allow user overrides
  ? Method extends keyof A[MatchedRoutes<Route, A>]
    ? A[MatchedRoutes<Route, A>][Method] extends {
        request: { query: infer T };
      }
      ? T
      : Default
    : A[MatchedRoutes<Route, A>]["default"] extends {
          request: { query: infer T };
        }
      ? T
      : Default
  : Default;

export type TypedInternalParams<
  Route,
  A extends object,
  Default,
  Method extends RouterMethod = RouterMethod,
> = Route extends string // TODO: Allow user overrides
  ? Method extends keyof A[MatchedRoutes<Route, A>]
    ? A[MatchedRoutes<Route, A>][Method] extends {
        request: { params: infer T };
      }
      ? T
      : Default
    : A[MatchedRoutes<Route, A>]["default"] extends {
          request: { params: infer T };
        }
      ? T
      : Default
  : Default;

export type TypedInternalBody<
  Route,
  A extends object,
  Default,
  Method extends RouterMethod = RouterMethod,
> = Route extends string // TODO: Allow user overrides
  ? Method extends keyof A[MatchedRoutes<Route, A>]
    ? A[MatchedRoutes<Route, A>][Method] extends {
        request: { body: infer T };
      }
      ? T
      : Default
    : A[MatchedRoutes<Route, A>]["default"] extends {
          request: { body: infer T };
        }
      ? T
      : Default
  : Default;

// Extract the route method from options which might be undefined or without a method parameter.
export type ExtractedRouteMethod<
  // TODO: improvement needed
  A extends object,
  R extends ExtendedFetchRequest<A>,
> = R extends string
  ? keyof A[MatchedRoutes<R, A>] extends RouterMethod
    ? keyof A[MatchedRoutes<R, A>]
    : RouterMethod
  : RouterMethod;

type MatchResult<
  Key extends string,
  Exact extends boolean = false,
  Score extends any[] = [],
  catchAll extends boolean = false,
> = {
  [k in Key]: { key: k; exact: Exact; score: Score; catchAll: catchAll };
}[Key];

type Subtract<
  Minuend extends any[] = [],
  Subtrahend extends any[] = [],
> = Minuend extends [...Subtrahend, ...infer Remainder] ? Remainder : never;

type TupleIfDiff<
  First extends string,
  Second extends string,
  Tuple extends any[] = [],
> = First extends `${Second}${infer Diff}`
  ? Diff extends ""
    ? []
    : Tuple
  : [];

type MaxTuple<N extends any[] = [], T extends any[] = []> = {
  current: T;
  result: MaxTuple<N, ["", ...T]>;
}[[N["length"]] extends [Partial<T>["length"]] ? "current" : "result"];

type CalcMatchScore<
  Key extends string,
  Route extends string,
  Score extends any[] = [],
  Init extends boolean = false,
  FirstKeySegMatcher extends string = Init extends true ? ":Invalid:" : "",
> = `${Key}/` extends `${infer KeySeg}/${infer KeyRest}`
  ? KeySeg extends FirstKeySegMatcher // return score if `KeySeg` is empty string (except first pass)
    ? Subtract<
        [...Score, ...TupleIfDiff<Route, Key, ["", ""]>],
        TupleIfDiff<Key, Route, ["", ""]>
      >
    : `${Route}/` extends `${infer RouteSeg}/${infer RouteRest}`
      ? `${RouteSeg}?` extends `${infer RouteSegWithoutQuery}?${string}`
        ? RouteSegWithoutQuery extends KeySeg
          ? CalcMatchScore<KeyRest, RouteRest, [...Score, "", ""]> // exact match
          : KeySeg extends `:${string}`
            ? RouteSegWithoutQuery extends ""
              ? never
              : CalcMatchScore<KeyRest, RouteRest, [...Score, ""]> // param match
            : KeySeg extends RouteSegWithoutQuery
              ? CalcMatchScore<KeyRest, RouteRest, [...Score, ""]> // match by ${string}
              : never
        : never
      : never
  : never;

type _MatchedRoutes<
  Route extends string,
  A extends object,
  MatchedResultUnion extends MatchResult<string> = MatchResult<
    Exclude<Exclude<keyof A, number>, symbol>
  >,
> = MatchedResultUnion["key"] extends infer MatchedKeys // spread union type
  ? MatchedKeys extends string
    ? Route extends MatchedKeys
      ? MatchResult<MatchedKeys, true> // exact match
      : MatchedKeys extends `${infer Root}/**${string}`
        ? MatchedKeys extends `${string}/**`
          ? Route extends `${Root}/${string}`
            ? MatchResult<MatchedKeys, false, [], true>
            : never // catchAll match
          : MatchResult<
              MatchedKeys,
              false,
              CalcMatchScore<Root, Route, [], true>
            > // glob match
        : MatchResult<
            MatchedKeys,
            false,
            CalcMatchScore<MatchedKeys, Route, [], true>
          > // partial match
    : never
  : never;

export type MatchedRoutes<
  Route extends string,
  A extends object,
  MatchedKeysResult extends MatchResult<string> = MatchResult<
    Exclude<Exclude<keyof A, number>, symbol>
  >,
  Matches extends MatchResult<string> = _MatchedRoutes<
    Route,
    A,
    MatchedKeysResult
  >,
> = Route extends "/"
  ? keyof A // root middleware
  : Extract<Matches, { exact: true }> extends never
    ?
        | Extract<
            Exclude<Matches, { score: never }>,
            { score: MaxTuple<Matches["score"]> }
          >["key"]
        | Extract<Matches, { catchAll: true }>["key"] // partial, glob and catchAll matches
    : Extract<Matches, { exact: true }>["key"]; // exact matches
