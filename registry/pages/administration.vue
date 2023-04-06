<template>
  <div>
    <v-card class="ma-4" elevation="4" >
    <v-tabs
      v-model="tab"
      color="primary"
    >
      <v-tab value="one">сотрудники</v-tab>
      <v-tab value="two"> управление </v-tab>
      <v-tab value="three"> еще </v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="one">
          <Table :headers="headers" :info="info"/>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
  </div>
  </template>
  
  <script setup>
  let tab = ref(null)

  let headers = ["имя","статус","должность","телефон","подразделение"]

  let info = [
  {name: "Олег", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Борис", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  {name: "Роман", status: "Онлайн", role: "Администратор", phone: "XXXX-XXX-XX-XX", cluster: "IT"},
  ]
  </script>
  
  