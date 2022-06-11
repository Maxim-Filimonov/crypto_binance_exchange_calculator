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
});
