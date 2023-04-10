<template>
  <TabMenu :components="comps"/>
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

let th2 = ["компания","услуга","стоимость"]

let data2 = [
  {name: "сиамс", role: "Обновление ПО", price: "1000" },
  {name: "сиамс", role: "Обработка данных", price: "1000"},
  {name: "сиамс", role: "Внесение изменений", price: "1000"},
]

// let compName = "Table"

// let comp = (await import(`@/components/forms/${compName}.vue`)).default
// comp.props={info : data, headers : th};

/*
let comps:any[] = [];
let menu=modManager.getModuleItemsMenu();
menu.foreach((item)=>{
  let form=item.getForm();
  comps.push({header:item.title, val:form?.form,prop:form?.prop});
})
*/

let comps= [{header : "Сотрудники", val : Table, prop : {info : data, headers : th}},
  {header : "Пациенты", val: ["Записаны","Прошлая неделя","Стационар"]},
  {header : "Отчеты", val: Table, prop : {info : data2, headers : th2}},
]
</script>
  
  