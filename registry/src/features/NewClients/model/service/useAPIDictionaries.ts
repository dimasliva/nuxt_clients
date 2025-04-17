import type { UseFetchOptions } from 'nuxt/app'
import { apiV1 } from '~/src/shared/api/api.config'

export function useAPIDictionaries<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
) {
  return useFetch(`${apiV1}/Dictionaries${url}`, {
    ...options,
    $fetch: useNuxtApp().$api as typeof $fetch
  })
}
