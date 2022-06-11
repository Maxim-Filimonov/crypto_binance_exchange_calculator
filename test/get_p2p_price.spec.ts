import { describe, test, expect } from "vitest";
import { getP2PPrice } from "~~/server/api/get_p2p_price";

describe("try", () => {
  test("it works", async () => {
    const result = await getP2PPrice("BTC");
    expect(result).toEqual(123);
  });
});
