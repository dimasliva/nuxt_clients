<template>
  <Table :cheked="checkEmpl" :info="data" :headers="th"></Table>
</template>
  
<script setup lang="ts">
import Table from '~~/components/forms/Table.vue';
import { ModuleManager } from '~~/lib/ModuleManager';
import { PageMap } from '~~/lib/PageMap';
import FormDialogFormTest  from '~~/components/forms/DialogFormTest.vue';
import  MenuTab  from '~~/components/MenuTab.vue';


const iocc=useContainer();
const modManager=iocc.get<ModuleManager>("ModuleManager");
const pageMap = iocc.get<PageMap>("PageMap");

pageMap.setPageData("/administration/employees", {title: "Сотрудники", icon: "",
mainBtnBar:[
    { id: "change", title: "Редактировать", icon: "mdi-pencil", disabled:false, color:"secondary", bkgColor:"red", 
      action: () =>  openDialog(FormDialogFormTest, {name:"petya"},true,()=>{console.debug("onClose invoked");return true;}  ) },
      
    { id: "addEmployee", title: "Добавить", icon: "mdi-account", disabled:false, color:"secondary", bkgColor:"red", action: () => openDialog(MenuTab, checkEmpl)},
]

});

let checkEmpl = ref([])

let th = ["id","имя","статус","должность","телефон","подразделение"]

let data = [
  {id: "1",name: "Олег", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {id: "2",name: "Борис", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {id: "3",name: "Роман", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {id: "4",name: "Олег", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {id: "5",name: "Борис", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {id: "6",name: "Роман", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
]


definePageMeta({
  keepalive: true,
});
</script>
  
  