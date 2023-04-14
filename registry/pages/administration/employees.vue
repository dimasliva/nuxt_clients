<template>
    <Table :info="data" :headers="th"></Table>
</template>
  
<script setup lang="ts">
import Table from '~~/components/forms/Table.vue';
import { ModuleManager } from '~~/lib/ModuleManager';

const iocc=useContainer();
const modManager=iocc.get<ModuleManager>("ModuleManager");

let th = ["имя","статус","должность","телефон","подразделение"]

let data = [
  {name: "Олег", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Борис", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Роман", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Олег", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Борис", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Роман", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
]
// let comps:any[] = [];
// let menu=modManager.getModuleItemsMenu();
// menu.foreach((item)=>{
//   let form=item.getForm();
//   comps.push({header:item.title, val:form?.form,prop:form?.prop});
// })


definePageMeta({
  keepalive: true,
});
</script>
  
  