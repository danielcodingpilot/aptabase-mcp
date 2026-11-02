import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { AptabaseClient } from "./client.js";

describe("AptabaseClient", () => {
  const realFetch = globalThis.fetch;
  let requested: URL[];

  beforeEach(() => {
    requested = [];
    globalThis.fetch = (async (url: URL | string) => {
      requested.push(new URL(url));
      return new Response("[]");
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  const client = () =>
    new AptabaseClient({ baseUrl: "https://eu.aptabase.com", authSession: "x" });

  describe("getHistoricalSessions", () => {
    it("sends the explicit date for paging", async () => {
      await client().getHistoricalSessions({
        appId: "app1",
        date: "2026-01-02T03:04:05Z",
      });
      assert.equal(requested[0].pathname, "/api/_stats/historical-sessions");
      assert.equal(requested[0].searchParams.get("date"), "2026-01-02T03:04:05Z");
    });

    it("falls back to endDate, then to now", async () => {
      await client().getHistoricalSessions({
        appId: "app1",
        endDate: "2026-02-01T00:00:00Z",
      });
      assert.equal(requested[0].searchParams.get("date"), "2026-02-01T00:00:00Z");

      await client().getHistoricalSessions({ appId: "app1" });
      assert.ok(requested[1].searchParams.get("date"));
    });
  });
});
