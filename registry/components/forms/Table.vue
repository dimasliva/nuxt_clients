<template>
    <v-row>
      <v-col>
        <v-card class="mx-4 my-0">
          <v-table  density="compact" class="rounded-t-lg">
            <thead class="bg-primary">
              <tr>
                <th class="pr-0">
                  <v-checkbox density="compact" :hide-details="true" v-model="chekedAll" color="tertiary" @click="chekAll" @update:model-value="$emit('cheked', cheked)"/>
                </th>
                <th class="ma-0 pa-0"></th>
                <th class="text-tertiary text-center" v-for="item in headers" :key="item.key" @click="sortList(item.key, info)">{{ item.title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in info" :key="item.name" @click="$emit('empl', item)" @dblclick="props.actions[0].action">
                <td class="pr-0" style="width: 50px;">
                    <v-checkbox density="compact" :hide-details="true" v-model="cheked" :value="item" color="secondary" @update:model-value="$emit('cheked', cheked)" @click="removeChek"/>
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
                  {{ item.name }}
                </td>
                <td class="text-center pa-0">
                  {{ item.phone }}
                </td>
                <td class="text-center pa-0">
                  {{ item.email }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </template>
  
<script setup lang="ts">

interface Header {
  key: string;
  title: string;
}

interface Action {
  title: string;
  icon: string;
  action: () => void;
}

interface Info {
  name: string;
  [key: string]: any;
}

let cheked: any = ref([])
let sorted = ref(false)
let chekedAll = ref(false)

const sortList = (sortBy: any, data: any) => {
  if(sorted.value == true){
    data.sort((x, y) => ((x[sortBy] < y[sortBy]) ? -1 : 1));
    sorted.value = false;
  } else {
    data.sort((x, y) => ((x[sortBy] > y[sortBy])? -1 : 1));
    sorted.value = true;
  };
}

const chekAll = () => {
  if(cheked.value == props.info){
    cheked.value = [];
    chekedAll.value = true;
    console.log(cheked.value)
  } else {
    cheked.value = props.info;
    chekedAll.value = false;
    console.log(cheked.value)
  }
};

const removeChek = () => {
  if(chekedAll.value == true){
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
})
</script>
  
