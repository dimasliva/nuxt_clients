//https://github.com/beholdr/maska
import { vMaska } from "maska"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("maska", vMaska)
})
