// plugins/vuetify.js
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {  md2 } from 'vuetify/blueprints'

const lightTheme = {
  dark: false,
  /*
  colors: {
    primary: '#2b5bb5',
    secondary: '#575e71',
    tertiary: '#e1e2ec',
    //info: '#EF9A9A',
    background: '#FFFFFF'
  }
  */

  colors: {

    secondary: '#575e71',
    tertiary: '#e1e2ec',

  }
}

const darkTheme = {
  dark: true,
  colors: {
    primary: '#b0c6ff',
    secondary: '#d9e2ff',
    tertiary: '#404659',
    //info: '#C62828',
    background: '#000000'
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    blueprint: md2,
    ssr: false,
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
    },
    theme: {
      defaultTheme: 'lightTheme',
        themes: {
          lightTheme,
          darkTheme
        }
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
