<template>
  <div>
        <h1>панель управления - начальный экран сотрудника где он может разместить нужные для себя функции и быстрый доступ к ним</h1>
  </div>
</template>

<script setup lang="ts">
import { PageMap } from '~/src/common/lib/PageMap';
import AddressEntity from '~/src/common/lib/MoApi/Records/DataEntities/AddressEntity';

const iocc=useContainer();
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get("RecordsStore");

pageMap.setPageData("/dashboard", {title: "Панель управления", icon: "mdi-view-dashboard"});

let gg=ref();

</script>

