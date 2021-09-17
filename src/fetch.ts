import destr from 'destr'
import { joinURL, withQuery } from 'ufo'
import type { Fetch, RequestInfo, RequestInit, Response } from './types'
import { createFetchError } from './error'

type Parser = (text: string) => any
type GetParser = (parse: Parser | boolean | undefined) => Parser | undefined

export interface CreateFetchOptions { fetch: Fetch }

export type FetchRequest = RequestInfo

export interface SearchParams { [key: string]: any }

const payloadMethods = ['patch', 'post', 'put']

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  baseURL?: string
  body?: RequestInit['body'] | Record<string, any>
  params?: SearchParams
  parse?: Parser | boolean
  response?: boolean
}

export interface FetchResponse<T> extends Response { data?: T }

export interface $Fetch {
  <T = any>(request: FetchRequest, opts?: FetchOptions): Promise<T>
  raw<T = any>(request: FetchRequest, opts?: FetchOptions): Promise<FetchResponse<T>>
}

const getParser: GetParser = (parse) => {
  if (!parse) {
    return undefined
  }

  return parse === true ? destr : parse
}

export function setHeader (options: FetchOptions, _key: string, value: string) {
  const key = _key.toLowerCase()
  options.headers = options.headers || {}
  if ('set' in options.headers) {
    ;(options.headers as Headers).set(key, value)
  } else if (Array.isArray(options.headers)) {
    const existingHeader = options.headers.find(([header]) => header.toLowerCase() === key)
    if (existingHeader) {
      existingHeader[1] = value
    } else {
      options.headers.push([key, value])
    }
  } else {
    const existingHeader = Object.keys(options.headers).find(header => header.toLowerCase() === key)
    options.headers[existingHeader || key] = value
  }
}

export function createFetch ({ fetch }: CreateFetchOptions): $Fetch {
  const raw: $Fetch['raw'] = async function (request, opts) {
    if (opts && typeof request === 'string') {
      if (opts.baseURL) {
        request = joinURL(opts.baseURL, request)
      }
      if (opts.params) {
        request = withQuery(request, opts.params)
      }
      if (opts.body && opts.body.toString() === '[object Object]' && payloadMethods.includes(opts.method?.toLowerCase() || '')) {
        opts.body = JSON.stringify(opts.body)
        setHeader(opts, 'content-type', 'application/json')
      }
    }
    const response: FetchResponse<any> = await fetch(request, opts as RequestInit)
    const text = await response.text()
    const parse = getParser(opts?.parse)
    response.data = parse ? parse(text) : text
    if (!response.ok) {
      throw createFetchError(request, response)
    }
    return response
  }

  const $fetch = function (request, opts) {
    return raw(request, { parse: destr, ...opts }).then(r => r.data)
  } as $Fetch

  $fetch.raw = raw

  return $fetch
}
