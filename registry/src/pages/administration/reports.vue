<template>
</template>
  
<script setup lang="ts">
import Table from '~forms/Table.vue';
import { PageMap } from '~/src/common/lib/PageMap';

const iocc=useContainer();
const pageMap = iocc.get<PageMap>("PageMap");

pageMap.setPageData("/administration/reports", {title: "Отчеты", icon: "mdi-account-circle"});

let comps = [ 
  {header : "Сотрудники", val : "administration/employees"},
  {header : "Пациенты", val: [{hed:"Записаны", path: "administration/visitors", },{hed:"Прошлая неделя", path: "administration/visitors", },{hed:"Стационар", path: "administration/visitors", }]},
  {header : "Отчеты", val: "administration/reports", },
]

</script>