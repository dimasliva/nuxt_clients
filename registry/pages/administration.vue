<template>
  <TabMenu :components="comps"/>
</template>
  
<script setup>
import Table from '~~/components/forms/Table.vue';

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

let th1 = ["Пациент","услуга","стоимость"]

let data1 = [
  {name: "Олег", role: "прием первичный", price: "1000" },
  {name: "Олег", role: "вакцинация", price: "1000"},
  {name: "Олег", role: "осмотр", price: "1000"},
]

// let compName = "Table"

// let comp = (await import(`@/components/forms/${compName}.vue`)).default
// comp.props={info : data, headers : th};
let comps = [ 
  {header : "Сотрудники", val : Table, prop : {info : data, headers : th}},
  {header : "Пациенты", val: [{hed:"Записаны", comp: Table, prop : {info : data1, headers : th1}},{hed:"Прошлая неделя", comp: Table, prop : {info : data, headers : th}},{hed:"Стационар", comp: Table, prop : {info : data2, headers : th2}}]},
  {header : "Отчеты", val: Table, prop : {info : data2, headers : th2}},
]
</script>
  
  