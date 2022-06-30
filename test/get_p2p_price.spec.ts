import { eachLike, like } from "@pact-foundation/pact/src/dsl/matchers";
import { describe, test, expect, beforeAll, afterEach, afterAll } from "vitest";
import { getP2PPrice } from "~~/server/api/get_p2p_price";

describe("try", () => {
  test("it works", async () => {
    await global.provider.addInteraction({
      state: "",
      withRequest: {
        method: "POST",
        path: "/bapi/c2c/v2/friendly/c2c/adv/search",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          fiat: "RUB",
          asset: "BTC",
          merchantCheck: true,
          payTypes: [],
          publisherType: "merchant",
          rows: 10,
          tradeType: "SELL",
          transAmount: "25000",
          page: 1,
        },
      },
      uponReceiving: "a request for bitcoin p2p prices for ruble",
      willRespondWith: {
        status: 200,
        body: {
          data: eachLike({
            adv: {
              price: "123",
            },
          }),
        },
      },
    });
    const result = await getP2PPrice({
      symbol: "BTC",
      baseApi: global.provider.mockService.baseUrl,
    });
    expect(result).toEqual("123");
  });
});
