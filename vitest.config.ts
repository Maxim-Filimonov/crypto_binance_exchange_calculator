import { defineConfig } from "vitest/config";
import { alias } from "./alias";

export default defineConfig({
  resolve: {
    alias,
  },
  test: {
    environment: "jsdom",
    deps: {
      inline: [/@nuxt\/test-utils-edge/],
    },
    setupFiles: ["./vitest_setup.ts"],
  },
});
