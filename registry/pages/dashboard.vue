<template>
    <div>
    <v-app>
      <v-main>
        <SideBar />
        <Table></Table>
        <InfoTab></InfoTab>
      </v-main>
    </v-app>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>

