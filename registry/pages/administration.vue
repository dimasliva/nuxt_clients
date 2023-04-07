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
  {name: "Олег", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Борис", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Роман", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
    {name: "Олег", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Борис", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Роман", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
]

let th1 = ["имя","отделение","телефон","возраст"]

let data1 = [
  {name: "Иван", role: "Гастро", phone: "XXXX-XXX-XX-XX", age: "47"},
  {name: "Илья", role: "Пульмо", phone: "XXXX-XXX-XX-XX", age: "35"},
  {name: "Георгий", role: "Кардиология", phone: "XXXX-XXX-XX-XX", age: "60"},
]

let th2 = ["компания","услуга","стоимость"]

let data2 = [
  {name: "сиамс", role: "Гастро", },
  {name: "сиамс", role: "Пульмо", },
  {name: "сиамс", role: "Кардиология", },
]

let compName = "Table"

let comp = (await import(`@/components/forms/${compName}.vue`)).default
comp.props={info : data, headers : th};
debugger
let comps = [ 
  {header : "Сотрудники", val : comp, prop : {info : data, headers : th}},
  {header : "Пациенты", val: Table, prop : {info : data1, headers : th1}},
  {header : "Пациенты", val: Table, prop : {info : data2, headers : th2}},
]
</script>
  
  