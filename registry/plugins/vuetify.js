// plugins/vuetify.js
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/lib/util/colors';

const lightTheme = {
  dark: false,
  colors: {
    primary: '#42A5F5',
    secondary: '#BBDEFB',
    info: '#EF9A9A',
  }
}

const darkTheme = {
  dark: true,
  colors: {
    primary: '#1976D2',
    secondary: '#2196F3',
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
