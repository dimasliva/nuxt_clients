import { getAccessToken } from "~/src/features/Auth/model/services/auth-token.service"
import { SERVER_URL } from "~/src/shared/api/api.config"

export default defineNuxtPlugin((nuxtApp) => {
    const access_token = getAccessToken()
    
    
    const api = $fetch.create({
      baseURL:SERVER_URL,
      onRequest({ request, options, error }) {
        if (access_token) {
          // note that this relies on ofetch >= 1.4.0 - you may need to refresh your lockfile
          options.headers.set('Authorization', `Bearer ${access_token}`)
        }
      },
      async onResponseError({ response }) {
        if (response.status === 401) {
          await nuxtApp.runWithContext(() => navigateTo('/login'))
        }
      }
    })
  
    // Expose to useNuxtApp().$api
    return {
      provide: {
        api
      }
    }
  })
  