import { Verifier } from "@pact-foundation/pact";
import { describe, it } from "vitest";
import { VerifierOptions } from "@pact-foundation/pact-node";
import path from "path";

describe("Pact Verification", () => {
  it("validates the expectations of binance api", () => {
    const baseOpts: VerifierOptions = {
      logLevel: "info",
      providerBaseUrl: "https://p2p.binance.com",
      providerVersion: process.env.GIT_COMMIT,
      providerVersionTags: process.env.GIT_BRANCH
        ? [process.env.GIT_BRANCH]
        : [],
      verbose: process.env.VERBOSE === "true",
    };

    // For builds triggered by a 'contract content changed' webhook,
    // just verify the changed pact. The URL will bave been passed in
    // from the webhook to the CI job.
    const pactChangedOpts: Partial<VerifierOptions> = {
      pactUrls: [process.env.PACT_URL],
    };

    // For 'normal' provider builds, fetch `master` and `prod` pacts for this provider
    const fetchPactsDynamicallyOpts: Partial<VerifierOptions> = {
      provider: "binance",
      consumerVersionSelectors: [
        { tag: "master", latest: true },
        { deployed: true },
      ], // the new way of specifying which pacts to verify
      pactUrls: [
        path.resolve(__dirname, "../../pacts/fiat-exchange-binance.json"),
      ],
      enablePending: true,
      includeWipPactsSince: "2020-01-01",
    };

    const stateHandlers = {};

    const requestFilter = (req, res, next) => {
      if (!req.headers["authorization"]) {
        next();
        return;
      }
      req.headers["authorization"] = `Bearer ${new Date().toISOString()}`;
      next();
    };

    const opts = {
      ...baseOpts,
      ...(process.env.PACT_URL ? pactChangedOpts : fetchPactsDynamicallyOpts),
      stateHandlers: stateHandlers,
      requestFilter: requestFilter,
    };

    return new Verifier(opts).verifyProvider().then((output) => {
      console.log("Pact Verification Complete!");
      console.log(output);
    });
  });
});
