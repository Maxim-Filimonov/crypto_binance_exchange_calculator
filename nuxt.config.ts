import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    "@vueuse/nuxt",
    "@nuxtjs/tailwindcss",
    // pinia plugin - https://pinia.esm.dev
    // "@pinia/nuxt",
    // unocss plugin - https://github.com/unocss/unocss
    // "@unocss/nuxt",
    // "@intlify/nuxt3",
    "@nuxtjs/color-mode",
  ],
});
