<template>
  <div style="min-width: 1024px; height: 100dvh;">
    <v-app>
      <v-main class="h-100">
        <SideBar />
      </v-main>
    </v-app>
  </div>
</template>
  
<script setup>
import SideBar from '~widgets/Layouts/SideBarLayout.vue';

</script>

<style>
html {
  overflow: hidden;
}
</style>