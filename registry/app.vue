<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
const route = useRoute()
const path = route.fullPath

definePageMeta({
  name: 'app',
  layout: path === '/list/new/clients' ? 'page' : 'default'
})


</script>