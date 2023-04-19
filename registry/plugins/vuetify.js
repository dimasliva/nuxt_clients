// plugins/vuetify.js
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/lib/util/colors';

const lightTheme = {
  dark: false,
  colors: {
    primary: '#2b5bb5',
    secondary: '#575e71',
    info: '#EF9A9A',
  }
}

const darkTheme = {
  dark: true,
  colors: {
    primary: '#b0c6ff',
    secondary: '#c0c6dc',
    info: '#C62828',
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
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
