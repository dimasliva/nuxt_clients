// plugins/vuetify.js
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {  md2 } from 'vuetify/blueprints'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { ru } from 'vuetify/locale'


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

    primary: '#5E35B1',
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
    locale: {
      locale: 'ru',
      fallback: 'ru',
      messages: { ru },
    },
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
    components: {
      VDateInput,
    },
  })

  nuxtApp.vueApp.use(vuetify)
})