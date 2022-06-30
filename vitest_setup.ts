import { Pact } from "@pact-foundation/pact";
import { afterAll, afterEach, beforeAll } from "vitest";
global.provider = new Pact({
  consumer: "fiat-exchange",
  provider: process.env.PACT_PROVIDER ? process.env.PACT_PROVIDER : "binance",
});

beforeAll(async () => {
  await global.provider.setup();
});
afterEach(async () => {
  await global.provider.verify();
});
afterAll(() => global.provider.finalize());
