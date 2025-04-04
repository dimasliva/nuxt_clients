<template>
    <div>
    </div>
  </template>

<script setup lang="ts">
import { PageMap } from '~/src/common/lib/PageMap';

const iocc=useContainer();
const pageMap = iocc.get<PageMap>("PageMap");

pageMap.setPageData("/journal", {title: "Журнал предварительной записи", icon: ""});

</script>