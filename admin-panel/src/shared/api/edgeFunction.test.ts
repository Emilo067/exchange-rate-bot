import { describe, expect, it } from "vitest";

import { edgeFunctionUrl } from "./edgeFunction";

describe("edgeFunctionUrl", () => {
  it("rejects a missing Supabase URL before making a request", () => {
    expect(() => edgeFunctionUrl("get-clients", "")).toThrow(
      "VITE_SUPABASE_URL is not configured",
    );
  });
});
