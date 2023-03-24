// https://nuxt.com/docs/api/configuration/nuxt-config
// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config"
import {Nitro} from "nitropack";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"//разрешение для nodejs принимать самоподписанные сертификаты https

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    auth: {
      name: "nuxt-session",
      password: process.env.NUXT_AUTH_PASSWORD || "",
    },
  },

  css: ['vuetify/lib/styles/main.sass'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
  "ssr":false,

  "typescript": {
    "typeCheck": false
  },

  hooks: {
    'nitro:build:before': (nitro: Nitro) => {
      nitro.options.moduleSideEffects.push('reflect-metadata')
    }
  }

});
