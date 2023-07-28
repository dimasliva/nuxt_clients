<template>
    <v-row>
      <v-col>
          <v-table density="compact" class="rounded-t-lg mx-2 elevation-1" :height="theight" fixed-header hover>
            <thead>
              <tr>
                <th class="pr-0 bg-primary" v-if="delRights">
                  <v-checkbox density="compact" :hide-details="true" v-model="chekedAll" color="tertiary" @click="chekAll" @update:model-value="$emit('cheked', cheked)"/>
                </th>
                <th class="ma-0 pa-0 bg-primary" v-if="delRights">{{ cheked.length }}</th>
                <th class="ma-0 pa-0 bg-primary" v-else></th>
                <!-- <th class="text-tertiary text-center bg-primary" v-for="item in headers" :key="item.key" @click="sortList(item.key, info[page! - 1])">{{ item.title }}</th> -->
                <th class="text-tertiary text-center bg-primary" v-if="rights.empProfRights.includes('r')" @click="sortList(headers[0].key, info[page! - 1])">{{ headers[0].title }}</th>
                <th class="text-tertiary text-center bg-primary" v-if="rights.empContRights.includes('r')" @click="sortList(headers[1].key, info[page! - 1])">{{ headers[1].title }}</th>
                <th class="text-tertiary text-center bg-primary" v-if="rights.empContRights.includes('r')" @click="sortList(headers[2].key, info[page! - 1])">{{ headers[2].title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in info[page! - 1]" :key="item.id" @mouseenter="$emit('person', item)" @dblclick="props.actions[0].action">
                <td class="pr-0" style="width: 50px;"  v-if="delRights">
                  <v-checkbox density="compact" :hide-details="true" v-model="cheked" :value="item" color="secondary" @update:model-value="$emit('cheked', cheked), removeChekAll()"/>
                </td>
                <td class="ma-0" style="width: 50px;" v-if="delRights||updRights">
                  <v-menu :open-on-hover="true">
                    <template v-slot:activator="{ props }">
                      <v-btn  v-bind="props" icon="mdi-dots-vertical" variant="text" ></v-btn>
                    </template>
                    <v-list>
                      <v-list-item v-for="action in actions" @click="$emit('person', item)" @click-once="action.action" >
                        <v-list-item-title>{{ action.title }}<v-icon end :icon="action.icon" size="x-small" /></v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
                <td v-else class="ma-0" style="width: 50px;">
                  <v-btn elevation='0' rounded="xl" icon="mdi-eye" @click="actions[0].action">
                  </v-btn>
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
import { useDisplay } from 'vuetify/lib/framework.mjs';

interface Header {
  key: string | any;
  title: string;
}

interface Rights {
empProfRights: string;
empContRights: string;
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
  mainPhone: string;
  mainEmail: string;
  id: string;
}

interface Info {
  el: Data,
}
let delRights = ref(false)
let updRights = ref(false)

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
  rights: {
    type: Object as () => Rights,
    required: true
  },
  page: Number,
})

let { name } = useDisplay();
let theight = computed(() => {
  switch (name.value) {
    case 'xs': return 100
    case 'sm': return 250
    case 'md': return 350
    case 'lg': return 500
    case 'xl': return 700
    case 'xxl': return 1000
  }

    return undefined
});
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


setTimeout(() => {
  delRights.value = props.rights.empProfRights.includes('d') && props.rights.empContRights.includes('d');
  updRights.value = props.rights.empProfRights.includes('u') && props.rights.empContRights.includes('u');
}, 500)

onBeforeUpdate(()=> {
  cheked.value = [];
  chekedAll.value = false;
})
</script>
  
