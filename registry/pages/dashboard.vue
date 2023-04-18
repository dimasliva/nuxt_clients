<template>
  <div>
        <h1>панель управления - начальный экран сотрудника где он может разместить нужные для себя функции и быстрый доступ к ним</h1>
  </div>
</template>

<script setup lang="ts">
import { PageMap } from '~~/lib/PageMap';

const iocc=useContainer();
const pageMap = iocc.get<PageMap>("PageMap");

pageMap.setPageData("/dashboard", {title: "Панель управления", icon: "mdi-view-dashboard"});

definePageMeta({
  keepalive: true
});
</script>

