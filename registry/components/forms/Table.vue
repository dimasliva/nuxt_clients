<template>
    <v-row>
      <v-col>
        <tr v-if="info.length == 0">
          <h1 class="text-center">Ничего не найдено, попробуйте изменить условия поиска</h1>
        </tr>
          <v-table v-else density="compact" class="rounded-t-lg mx-2 elevation-1" height="74vh" fixed-header hover>
            <thead>
              <tr>
                <th class="pr-0 bg-primary">
                  <v-checkbox density="compact" :hide-details="true" v-model="chekedAll" color="tertiary" @click="chekAll" @update:model-value="$emit('cheked', cheked)"/>
                </th>
                <th class="ma-0 pa-0 bg-primary" >{{ cheked.length }}</th>
                <th class="text-tertiary text-center bg-primary" v-for="item in headers" :key="item.key" @click="sortList(item.key, info[page! - 1])">{{ item.title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in info[page! - 1]" :key="item.id" @click="$emit('empl', item)" @dblclick="props.actions[0].action">
                <td class="pr-0" style="width: 50px;">
                    <v-checkbox density="compact" :hide-details="true" v-model="cheked" :value="item" color="secondary" @update:model-value="$emit('cheked', cheked), removeChekAll()"/>
                </td>
                <td class="ma-0" style="width: 50px;">
                  <v-menu :open-on-hover="true">
                    <template v-slot:activator="{ props }">
                      <v-btn  v-bind="props" icon="mdi-dots-vertical" variant="text" ></v-btn>
                    </template>
                    <v-list>
                      <v-list-item v-for="action in actions" @click="$emit('empl', item)" @click-once="action.action" >
                        <v-list-item-title>{{ action.title }}<v-icon end :icon="action.icon" size="x-small" /></v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
                <td class="text-center pa-0">
                  {{ item.surname +" "+ item.name +" "+ item.patronymic  }}
                </td>
                <td class="text-center pa-0">
                  {{ item.mainPhone }}
                </td>
                <td class="text-center pa-0">
                  {{ item.mainEmail }}
                </td>
              </tr>
            </tbody>
          </v-table>
      </v-col>
    </v-row>
  </template>
  
<script setup lang="ts">

interface Header {
  key: string | any;
  title: string;
}

interface Action {
  title: string;
  icon: string;
  action: () => void;
}

interface Data {
  name: string;
  surname: string;
  patronymic: string;
  gender: string;
  birthdate: string;
  mainPhone: string;
  mainEmail: string;
  id: string;
}

interface Info {
  el: Data,
}

let cheked: any = ref([])
let sorted = ref(false)
let chekedAll = ref(false)
let selected = ref(false)

const sortList = (sortBy: any, data: any) => {
  const sorting = () => {
    if(sorted.value == true){
      data.sort((a, b) => ((a[sortBy] < b[sortBy]) ? -1 : 1));
      sorted.value = false;
    } else {
      data.sort((a, b) => ((a[sortBy] > b[sortBy])? -1 : 1));
      sorted.value = true;
    };
  }
  if(Array.isArray(sortBy)){
    if(sorted.value == true){
      data.sort((a, b) => ((a.surname === b.surname) ?( (a.name < b.name)? -1 : 1) : ( (a.surname < b.surname)? -1 : 1) ));
      sorted.value = false;
    } else {
      data.sort((a, b) => ((a.surname === b.surname) ?( (a.name > b.name)? -1 : 1) : ( (a.surname > b.surname)? -1 : 1) ));
      sorted.value = true;
    };
  } else {
    sorting();
  }
}

const chekAll = () => {
  if(cheked.value.length == props.info.flat().length){
    cheked.value = [];
    chekedAll.value = true;
  } else {
    cheked.value = props.info.flat().slice();
    chekedAll.value = false;
  }
};

const removeChekAll = () => {
  if(cheked.value.length == props.info.flat().length){
    chekedAll.value = true
  } else {
    chekedAll.value = false
  }
}

const props = defineProps ({
  info: {
    type: Array as () => Info[],
    required: true,
  },
  headers: {
    type: Array as () => Header[],
    required: true,
  },
  actions: {
    type: Array as () => Action[],
    required: true,
  },
  page: Number,
})
</script>
  
