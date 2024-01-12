// https://nuxt.com/docs/api/configuration/nuxt-config
// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config"
import type { Nitro } from "nitropack/types";
import { createResolver } from '@nuxt/kit'
import vuetify from 'vite-plugin-vuetify'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"//разрешение для nodejs принимать самоподписанные сертификаты https

const mainApiServer = "172.16.121.60";
const mainApiServerPort = 7132;
const { resolve } = createResolver(import.meta.url)

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    auth: {
      name: "nuxt-session",
      password: process.env.NUXT_AUTH_PASSWORD || "",
    },

    mainApiServer: mainApiServer,
    mainApiServerPort: mainApiServerPort,
    appId: "78064056-8C89-4057-9AC9-2836AE605E1D",

  },
  
  css: ['vuetify/lib/styles/main.sass'],
  build: {
    transpile: ['vuetify', '@vuepic/vue-datepicker','vue-sonner'],
  },
  
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    //for nuxt 3.7
    esbuild: {
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true
          }
        }
    }
  },

  "ssr": false,

  "typescript": {
    "typeCheck": false
  },

  hooks: {
    'nitro:build:before': (nitro: Nitro) => {
      nitro.options.moduleSideEffects.push('reflect-metadata')
    },
    'vite:extendConfig': (config) => {
      config.plugins?.push(
        vuetify({
          styles: {configFile: resolve('./settings.scss')},
        })
      )
    }
  },

  proxy: {
    proxies: {
      '^/swagger/.*': {
        target: `https://${mainApiServer}:${mainApiServerPort}`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },

      '^/api/v1/RegisterCompany/.*': {
        target: `https://${mainApiServer}:${mainApiServerPort}`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      
    }
  },
  
  modules: ['@nuxt-alt/proxy','@vueuse/nuxt','@nuxtjs/i18n'],



  nitro: {
    esbuild: {
      options: {
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true
          }
        }
      }
    }
  }


});
