# lighty-examples

Example tests for [`@azeljkovic/lighty`](https://www.npmjs.com/package/@azeljkovic/lighty) library, using a local httpbin service as the target API.

The repository is intentionally small: each test file demonstrates one area of the `lighty` client and assertion API against well-known httpbin endpoints.

## What This Repository Shows

- Creating a reusable `lighty` HTTP client with a base URL, timeout, logging, and HTTP error handling.
- Sending `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `HEAD`, and custom requests.
- Passing query parameters, headers, request bodies, redirect options, and response type options.
- Asserting status codes, response classes, redirects, headers, JSON bodies, text bodies, binary bodies, and image formats.
- Testing success, redirect, client error, server error, authentication, cookies, streaming, delayed responses, and content negotiation.

## Requirements

- Node.js with support for running TypeScript files directly from tests. Node.js 24 or newer is recommended.
- pnpm 11.9.0, as declared by `packageManager` in `package.json`.
- A local httpbin server available at `http://localhost`.

The shared client is defined in [`httpbin/client.ts`](./httpbin/client.ts):

```ts
import { createClient } from "@azeljkovic/lighty";

export const client = createClient({
  baseUrl: "http://localhost",
  timeoutMs: 5_000,
  throwOnHttpError: false,
  logger: "verbose",
});
```

Because `baseUrl` is `http://localhost` without an explicit port, the examples expect the service to be reachable on the default HTTP port, port `80`.

## Installation

Install dependencies with pnpm:

```sh
pnpm install
```

## Running httpbin Locally

Start httpbin (https://httpbin.org/) service that exposes the endpoints used by the tests on `http://localhost`.

One common Docker-based setup is:

```sh
docker run --rm -p 80:80 kennethreitz/httpbin
```

If port `80` is unavailable, update `baseUrl` in [`httpbin/client.ts`](./httpbin/client.ts) to include the port your local service uses, for example:

```ts
baseUrl: "http://localhost:8080";
```

## Scripts

```sh
pnpm test:httpbin
```

Runs all httpbin examples with Node's built-in test runner:

```sh
node --test httpbin/*.test.js
```

```sh
pnpm lint
```

Runs ESLint over the repository.

```sh
pnpm format
```

Formats the repository with Prettier.

```sh
pnpm format:check
```

Checks formatting without writing changes.

## Project Layout

```text
.
├── eslint.config.js
├── package.json
├── pnpm-lock.yaml
└── httpbin
    ├── client.ts
    ├── anything.test.js
    ├── auth.test.js
    ├── cookies.test.js
    ├── dynamic-data.test.js
    ├── http-methods.test.js
    ├── images.test.js
    ├── redirects.test.js
    ├── request-inspection.test.js
    ├── response-formats.test.js
    ├── response-inspection.test.js
    └── status-codes.test.js
```

## Test Coverage by File

| File                                                                           | Demonstrates                                                                                                   |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| [`httpbin/anything.test.js`](./httpbin/anything.test.js)                       | Echo-style requests to `/anything` and `/anything/{path}`, including query parameters and JSON bodies.         |
| [`httpbin/auth.test.js`](./httpbin/auth.test.js)                               | Basic authentication, failed authentication, and bearer token authentication.                                  |
| [`httpbin/cookies.test.js`](./httpbin/cookies.test.js)                         | Reading cookies from request headers and validating `Set-Cookie` behavior for cookie set/delete endpoints.     |
| [`httpbin/dynamic-data.test.js`](./httpbin/dynamic-data.test.js)               | Base64 decoding, random bytes, delayed responses, drip responses, generated links, ranges, streams, and UUIDs. |
| [`httpbin/http-methods.test.js`](./httpbin/http-methods.test.js)               | Common HTTP verbs and assertion helpers for status codes, headers, JSON bodies, and empty responses.           |
| [`httpbin/images.test.js`](./httpbin/images.test.js)                           | Binary and text response handling for PNG, JPEG, WebP, SVG, and content-negotiated image responses.            |
| [`httpbin/redirects.test.js`](./httpbin/redirects.test.js)                     | Followed redirects and manually inspected redirect responses.                                                  |
| [`httpbin/request-inspection.test.js`](./httpbin/request-inspection.test.js)   | httpbin endpoints that return request headers, requester IP address, and user agent details.                   |
| [`httpbin/response-formats.test.js`](./httpbin/response-formats.test.js)       | Brotli, deflate, gzip, HTML, JSON, text, UTF-8, robots.txt, and XML responses.                                 |
| [`httpbin/response-inspection.test.js`](./httpbin/response-inspection.test.js) | Cache behavior, ETags, and response headers generated from query parameters.                                   |
| [`httpbin/status-codes.test.js`](./httpbin/status-codes.test.js)               | Dedicated status assertion helpers for 2xx, 3xx, 4xx, and 5xx responses.                                       |

## Lighty Patterns Used

### Reusable Client

All examples import the same configured client:

```js
import { client } from "./client.ts";
```

This keeps the tests focused on request behavior and assertions rather than repeated setup.

### Request Helpers

The examples use method-specific helpers:

```js
await client.getRequest("/get");
await client.postRequest("/post", { body: { name: "Ada Lovelace" } });
await client.patchRequest("/patch", { body: { name: "Ada Lovelace" } });
await client.putRequest("/put", { body: { name: "Ada Lovelace" } });
await client.deleteRequest("/delete", {});
await client.headRequest("/get", {});
```

They also show `customRequest` for explicit request configuration:

```js
await client.customRequest({
  method: "GET",
  url: "/headers",
});
```

### Request Options

Several tests pass options such as:

```js
await client.getRequest("/redirect-to", {
  params: {
    url: "/get",
    status_code: 302,
  },
  redirect: "manual",
  responseType: "text",
});
```

Common options used in this repository include:

- `params` for query string values.
- `headers` for request headers such as `Authorization`, `Accept`, and `Cookie`.
- `body` for JSON request payloads.
- `redirect` for controlling redirect handling.
- `responseType` for text, JSON, and binary responses.

### Assertion Helpers

The tests combine Node's built-in assertions with `lightyAssert` helpers:

```js
import assert from "node:assert/strict";
import { lightyAssert } from "@azeljkovic/lighty";
```

Examples include:

- `lightyAssert.statusCodeIs(result, 200)`
- `lightyAssert.statusCodeIs2xx(result)`
- `lightyAssert.responseIsOk(result)`
- `lightyAssert.responseIsUnauthorized(result)`
- `lightyAssert.headerExists(result, "server")`
- `lightyAssert.headerContentTypeIs(result, "application/json")`
- `lightyAssert.bodyContains(result, { authenticated: true })`
- `lightyAssert.bodyTextContains(result, "Unicode Demo")`
- `lightyAssert.bodyIsPng(result)`
- `lightyAssert.responseRedirectsTo(result, "/get")`

## Running a Single Test File

Use Node's test runner directly when you want to focus on one area:

```sh
node --test httpbin/status-codes.test.js
```

For verbose test output:

```sh
node --test --test-reporter=spec httpbin/status-codes.test.js
```

## Troubleshooting

### `ECONNREFUSED` or connection errors

The local httpbin-compatible service is probably not running, is not listening on port `80`, or `httpbin/client.ts` points at the wrong base URL.

Check the server first:

```sh
curl http://localhost/get
```

### Port `80` requires elevated permissions

Some systems require elevated permissions to bind port `80`. Run httpbin on another port and update `baseUrl`, for example:

```ts
baseUrl: "http://localhost:8080";
```

### Header or body equality failures

Some tests intentionally assert exact reflected request data, including headers and host values. If your local httpbin implementation or Node.js runtime sends different default headers, update the expected values in the affected test or relax the assertion to use `bodyContains`.

### Timeout test fails unexpectedly

[`httpbin/dynamic-data.test.js`](./httpbin/dynamic-data.test.js) includes a delayed-response test that expects a timeout from the shared client:

```js
await assert.rejects(client.getRequest(`/delay/${delay}`, {}), {
  name: "TimeoutError",
});
```

The shared client timeout is `5_000` milliseconds, and the test uses `/delay/10`.
