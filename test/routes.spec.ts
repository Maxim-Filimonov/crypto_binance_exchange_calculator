import { describe, expect, test } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils-edge";

describe("Routes", async () => {
  await setup({
    // test context options
  });

  test("Index Page", async () => {
    const res = await $fetch("/");
    expect(res).toContain("Crypto");
  });
  test("get p2p price api", async () => {
    const res = await $fetch("/api/get_p2p_price");
    expect(parseInt(res.price)).toBeGreaterThan(0);
  });
});
