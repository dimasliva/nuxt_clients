<template>

        <h1>reports</h1>
</template>
  
<script setup lang="ts">
import Table from '~~/components/forms/Table.vue';
import { ModuleManager } from '~~/lib/ModuleManager';
import { PageMap } from '~~/lib/PageMap';

const iocc=useContainer();
const modManager=iocc.get<ModuleManager>("ModuleManager");
const pageMap = iocc.get<PageMap>("PageMap");

pageMap.setPageData("/administration/reports", {title: "Отчеты", icon: "mdi-account-circle"});

let comps = [ 
  {header : "Сотрудники", val : "administration/employees"},
  {header : "Пациенты", val: [{hed:"Записаны", path: "administration/visitors", },{hed:"Прошлая неделя", path: "administration/visitors", },{hed:"Стационар", path: "administration/visitors", }]},
  {header : "Отчеты", val: "administration/reports", },
]

definePageMeta({
  keepalive: true,
});


</script>