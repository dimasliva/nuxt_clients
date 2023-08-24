<template>
</template>

<script setup lang="ts">
import Table from '~~/components/forms/Table.vue';
import { PageMap } from '~~/lib/PageMap';

const iocc=useContainer();
const pageMap = iocc.get<PageMap>("PageMap");

pageMap.setPageData("/visitors", {title: "Посетители", icon: ""});

let comps = [ 
  {header : "Сотрудники", val : "administration/employees"},
  {header : "Пациенты", val: [{hed:"Записаны", path: "administration/visitors", },{hed:"Прошлая неделя", path: "administration/visitors", },{hed:"Стационар", path: "administration/visitors", }]},
  {header : "Отчеты", val: "administration/reports", },
]

definePageMeta({
  keepalive: true
});
</script>