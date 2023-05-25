<template>
  <v-row>
    <v-skeleton-loader :loading="loading" type="table-tbody@2" class="pa-0 ma-0 w-100" >
    <Table @cheked="checkEmpl = $event, disabledFunc(), $emit('clicked')" @empl="checkEmpl = $event" :info="filteredData.length? filteredData : data" :checkbox-show="show" :headers="th" :actions="tableActions"></Table>
    <v-expand-x-transition>
      <v-card v-show="drawer" class="mx-auto bg-tertiary" height="300" width="300">
        <div class="ma-1 text-body-1">Фильтровать по:</div>
        <v-col>
          <v-text-field v-for="item in th" v-model="item.model" :label="item.title" class="ma-1" variant="outlined" color="secondary" @update:model-value="filterItems(data, item.model, item.key)"/>
        </v-col>
      </v-card>
    </v-expand-x-transition>
  </v-skeleton-loader>
  </v-row>
</template>
  
<script setup lang="ts">
import { EmployeeRecord, IEmployeeRecordData } from '~~/lib/MoApi/Records/EmployeeRecord';
import { VSkeletonLoader } from 'vuetify/labs/components';
import Table from '~~/components/forms/Table.vue';
import { MoApiClient } from '~~/lib/MoApi/MoApiClient';
import { PageMap } from '~~/lib/PageMap';
import EmplProfileDialog  from '~~/components/forms/EmplProfileDialog.vue';
import ConfirmActionDialog  from '~~/components/forms/ConfirmActionDialog.vue';
import type { RecordsStore } from '~~/lib/MoApi/Records/RecordsStore'

let drawer = ref(false)
let show = ref(false)
let loading = ref(false)

const iocc=useContainer();
const apiClient = iocc.get<MoApiClient>("MoApiClient");
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get<RecordsStore>("RecordsStore");
let checkEmpl = ref([]);
let deleteBtn = ref(true);

const pageDataLoad = () =>{ pageMap.setPageData("/administration/employees", {title: "Сотрудники", icon: "",
mainBtnBar:[
    { id: "update", title: "Обновить", icon: "mdi-autorenew", disabled:false, color:"secondary", bkgColor:"red", 
     action: () => getEmplData() },
    { id: "addEmployee", title: "Добавить", icon: "mdi-account", disabled:false, color:"secondary", bkgColor:"red", 
    action: () => openDialog(EmplProfileDialog,  {empl: '', action: addEmployee}) },
    { id: "delete", title: "Удалить", icon: "mdi-delete", disabled: deleteBtn.value, color:"secondary", bkgColor:"red", 
     action: () => openDialog(ConfirmActionDialog, {empl: checkEmpl.value, action: deleteEmpl}) },
    { id: "filter", title: "", icon: "mdi-filter", disabled:false, color:"secondary", bkgColor:"red", 
     action: () =>  (drawer.value = !drawer.value) },
  ]
});
}
pageDataLoad();

const getEmplData = () => {
  loading.value = true;
  setTimeout(() => loading.value = false, 2000);
}

const addEmployee = async (name: string, surname: string, patronymic: string, gender: string, birthdate: string) => {
  recStore.getNew<EmployeeRecord, IEmployeeRecordData>(EmployeeRecord, (data) => {
    data.name = name;
    data.surname = surname;
    data.patronymic = patronymic;
    data.gender = gender;
    data.birthdate = "2023-05-25T05:12:08.774Z";
    data.roles = "admin";
  })
}

const editEmployee = (name: string, phone: string, email: string, id: string) => {
  getEmplData();
  data.value.forEach(empl => {
    if(empl.id == id){
      empl.name = name;
      empl.phone = phone;
      empl.email = email;
    }
  });
}

const disabledFunc = () => {
(checkEmpl.value.length >= 1 && checkEmpl.value.length <= 5000)? deleteBtn.value = false : deleteBtn.value = true;
pageDataLoad();
}

const deleteEmpl = (id: any) => {
console.log(id)
let index = data.value.findIndex(empl => empl.id === id);
if (index !== -1) {
   data.value.splice(index, 1);
};
disabledFunc();
getEmplData();
}

const filterItems = (arr, value, params) => {
  filteredData.value = arr.filter(empl => {
      if (Array.isArray(params)) {
        return params.some(p => empl[p].toLowerCase().indexOf(value.toLowerCase()) !== -1);
      } else {
        return empl[params].toLowerCase().indexOf(value.toLowerCase()) !== -1;
      };
  });
}

let filteredData = ref([])


let th = [{title: "ФИО", key: ["surname", "name", "patronymic"], model: ""},{title: "Телефон", key: "phone", model: ""}, {title: "E-mail", key: "email", model: ""}]

let data = ref<any>([])

let tableActions = ref([
      { id: "change", title: "Редактировать", icon: "mdi-pencil", color:"secondary", bkgColor:"red", 
      action: () =>  openDialog(EmplProfileDialog, {empl: checkEmpl.value, action: editEmployee}) },
      { id: "delete", title: "Удалить", icon: "mdi-delete", color:"secondary", bkgColor:"red", 
      action: () =>  openDialog(ConfirmActionDialog, {empl: checkEmpl.value, action: deleteEmpl}) },
])

</script>
  
  