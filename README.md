
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]
[![bundle][bundle-src]][bundle-href]

![😱 ohmyfetch](.github/banner.svg)

## 🚀 Quick Start

Install:

```bash
# npm
npm i ohmyfetch

# yarn
yarn add ohmyfetch
```

Import:

```js
// ESM / Typescript
import { $fetch } from 'ohmyfetch'

// CommonJS
const { $fetch } = require('ohmyfetch')
```

<details>
  <summary>Spoiler</summary>
  <img src="https://media.giphy.com/media/Dn1QRA9hqMcoMz9zVZ/giphy.gif">
</details>

## ✔️ Works in Node.js

We use [conditional exports](https://nodejs.org/api/packages.html#packages_conditional_exports) to detect Node.js
 and automatically use [node-fetch](https://github.com/node-fetch/node-fetch) polyfill! No changes required.

## ✔️ Parsing Response

`$fetch` Smartly parses JSON and native values using [destr](https://github.com/unjs/destr) and fallback to text if it fails to parse.

```js
const { users } = await $fetch('/api/users')
```

## ✔️ JSON Body

`$fetch` automatically stringifies request body (if an object is passed) and adds JSON `Content-Type` headers (for `put`, `patch` and `post` requests).

```js
const { users } = await $fetch('/api/users', { method: 'POST', body: { some: 'json' } })
```

## ✔️ Handling Errors

`$fetch` Automatically throw errors when `response.ok` is `false` with a friendly error message and compact stack (hiding internals).

Parsed error body is available with `error.data`. You may also use `FetchError` type.

```ts
await $fetch('http://google.com/404')
// FetchError: 404 Not Found (http://google.com/404)
//     at async main (/project/playground.ts:4:3)
```

In order to bypass errors as response you can use `error.data`:

```ts
await $fetch(...).catch((error) => error.data)
```

## ✔️ Type Friendly

Response can be type assisted:

```ts
const article = await $fetch<Article>(`/api/article/${id}`)
// Auto complete working with article.id
```

## ✔️ Adding `baseURL`

By using `baseURL` option, `$fetch` prepends it with respecting to trailing/leading slashes and query params for baseURL using [ufo](https://github.com/unjs/ufo):

```js
await $fetch('/config', { baseURL })
```

## ✔️ Adding params

By using `params` option, `$fetch` adds params to URL by preserving params in request itself using [ufo](https://github.com/unjs/ufo):

```js
await $fetch('/movie?lang=en', { params: { id: 123 } })
```

## 🍣 Access to Raw Response

If you need to access raw response (for headers, etc), can use `$fetch.raw`:

```js
const response = await $fetch.raw('/sushi')

// response.data
// response.headers
// ...
```

## ✔️ Custom JSON parsing

By using `parse` option, `$fetch` determines how to parse data.

```js
// Disable JSON parsing
await $fetch('/movie?lang=en', { parse: false })

// Use JSON.parse to parse
await $fetch('/movie?lang=en', { parse: JSON.parse })
```

## 📦 Bundler Notes

- All targets are exported with Module and CommonJS format and named exports
- No export is transpiled for sake of modern syntax
  - You probably need to transpile `ohmyfetch`, `destr` and `ufo` packages with babel for ES5 support
- You need to polyfill `fetch` global for supporting legacy browsers like using [unfetch](https://github.com/developit/unfetch)

## ❓ FAQ

**Why export is called `$fetch` instead of `fetch`?**

Using the same name of `fetch` can be confusing since API is different but still it is a fetch so using closest possible alternative. You can however, import `{ fetch }` from `ohmyfetch` which is auto polyfilled for Node.js and using native otherwise.

**Why not having default export?**

Default exports are always risky to be mixed with CommonJS exports.

This also guarantees we can introduce more utils without breaking the package and also encourage using `$fetch` name.

**Why not transpiled?**

By keep transpiling libraries we push web backward with legacy code which is unneeded for most of the users.

If you need to support legacy users, you can optionally transpile the library in your build pipeline.

## License

MIT. Made with 💖

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/ohmyfetch?style=flat-square
[npm-version-href]: https://npmjs.com/package/ohmyfetch

[npm-downloads-src]: https://img.shields.io/npm/dm/ohmyfetch?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/ohmyfetch

[github-actions-src]: https://img.shields.io/github/workflow/status/unjs/ohmyfetch/ci/main?style=flat-square
[github-actions-href]: https://github.com/unjs/ohmyfetch/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/ohmyfetch/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/ohmyfetch

[bundle-src]: https://img.shields.io/bundlephobia/minzip/ohmyfetch?style=flat-square
[bundle-href]: https://bundlephobia.com/result?p=ohmyfetch
