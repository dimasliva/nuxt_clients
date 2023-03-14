// https://nuxt.com/docs/api/configuration/nuxt-config
// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config"

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  css: ['vuetify/lib/styles/main.sass'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
})
