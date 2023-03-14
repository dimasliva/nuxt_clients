import defCtx from "~~/models/context"

export default defineNuxtRouteMiddleware(() => {
    if (!defCtx.isAuth) {
      return navigateTo('/signin')
    }
  })
  