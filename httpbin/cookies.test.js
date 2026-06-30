import {describe, it} from "node:test";
import {client} from "./client.ts";
import assert from "node:assert/strict";
import {lightyAssert} from "@azeljkovic/lighty";

describe("works with cookies", () => {
  it("returns cookie data", async () => {
    const result = await client.getRequest("/cookies", {
      headers: {
        Cookie: "session=lighty; theme=dark",
      },
    });

    // response code
    lightyAssert.statusCodeIs(result, 200);
    // headers
    lightyAssert.headerExists(result, "server");
    lightyAssert.headerContentTypeIs(result, "application/json");
    // body
    lightyAssert.bodyEquals(result, {
      cookies: {
        session: "lighty",
        theme: "dark",
      },
    });
  });

  it("deletes cookies provided by query parameters", async () => {
    const result = await client.getRequest("/cookies/delete", {
      redirect: "manual",
      responseType: "text",
      params: {
        session: "123",
        theme: "light",
      },
    });

    // response code
    lightyAssert.statusCodeIs(result, 302);
    // redirect
    lightyAssert.headerIs(result, "location", "/cookies");
    // headers
    lightyAssert.headerExists(result, "server");
    assertSetCookie(result, "session=;");
    assertSetCookie(result, "theme=;");
    assertSetCookie(result, "Max-Age=0");
  });

  it("sets cookies provided by query parameters", async () => {
    const result = await client.getRequest("/cookies/set", {
      redirect: "manual",
      responseType: "text",
      params: {
        session: "lighty",
        theme: "dark",
      },
    });

    // response code
    lightyAssert.statusCodeIs(result, 302);
    // redirect
    lightyAssert.headerIs(result, "location", "/cookies");
    // headers
    lightyAssert.headerExists(result, "server");
    assertSetCookie(result, "session=lighty;");
    assertSetCookie(result, "theme=dark;");
  });

  it("sets a cookie using path parameters", async () => {
    const result = await client.getRequest("/cookies/set/session/lighty", {
      redirect: "manual",
      responseType: "text",
    });

    // response code
    lightyAssert.statusCodeIs(result, 302);
    // redirect
    lightyAssert.headerIs(result, "location", "/cookies");
    // headers
    lightyAssert.headerExists(result, "server");
    assertSetCookie(result, "session=lighty;");
  });
});

function assertSetCookie(result, expectedValue) {
  const setCookieHeaders =
    typeof result.response.headers.getSetCookie === "function"
      ? result.response.headers.getSetCookie()
      : [result.response.headers.get("set-cookie")].filter(Boolean);

  assert.ok(
    setCookieHeaders.some((header) => header.includes(expectedValue)),
    `Expected Set-Cookie to include ${expectedValue}; received ${setCookieHeaders.join(", ")}`,
  );
}
