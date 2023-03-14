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
    info: '#EF9A9A',
    radio: '#448AFF',
    background: '#FFFFFF'
  }
}

const darkTheme = {
  dark: true,
  colors: {
    primary: '#0D47A1',
    info: '#C62828',
    radio: '#304FFE',
    background: '#424242'
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    ssr: true,
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
