<template>
  <v-row>
    <Table @cheked="checkEmpl = $event" :info="data" :checkbox-show="show" :headers="th" ></Table>
      <v-expand-x-transition>
        <v-card v-show="drawer" class="mx-auto bg-tertiary" height="200" width="300">
          <div class="ma-1 text-body-1">Сортировать по:</div>
          <v-col>
        <v-btn v-for="item in th" class="ma-1" variant="outlined" color="secondary" @click="sortList(item.key)">
            {{ item.title }}
          </v-btn>
        </v-col>
      </v-card>
      </v-expand-x-transition>
</v-row>
</template>
  
<script setup lang="ts">
import Table from '~~/components/forms/Table.vue';
import { ModuleManager } from '~~/lib/ModuleManager';
import { PageMap } from '~~/lib/PageMap';
import FormDialogFormTest  from '~~/components/forms/DialogFormTest.vue';
import FormDialogForm  from '~~/components/forms/DialogForm.vue';

let drawer = ref(false)
let sorted = ref(false)
let show = ref(false)

const iocc=useContainer();
const modManager = iocc.get<ModuleManager>("ModuleManager");
const pageMap = iocc.get<PageMap>("PageMap");
let checkEmpl = ref([])

pageMap.setPageData("/administration/employees", {title: "Сотрудники", icon: "",
mainBtnBar:[
    { id: "select", title: "Выбрать", icon: "mdi-checkbox-marked", disabled:false, color:"secondary", bkgColor:"red", 
      action: () =>  show.value = !show.value },
    { id: "update", title: "Обновить", icon: "mdi-autorenew", disabled:false, color:"secondary", bkgColor:"red", 
     action: () => refreshNuxtData('data') },
    { id: "change", title: "Редактировать", icon: "mdi-pencil", disabled: (checkEmpl.value.length == 1)? false : true, color:"secondary", bkgColor:"red", 
      action: () =>  useDialogOpen(FormDialogForm, {empls: checkEmpl, onClose:()=>{console.log(checkEmpl.value)} }) },
    { id: "addEmployee", title: "Добавить", icon: "mdi-account", disabled:false, color:"secondary", bkgColor:"red", 
    action: () => useDialogOpen(FormDialogFormTest,  {emplData: checkEmpl, onClose:()=>{console.debug("onClose invoked")} }) },
    { id: "delete", title: "Удалить", icon: "mdi-delete", disabled:(checkEmpl.value.length >= 1 && checkEmpl.value.length <= 5000)? false : true, color:"secondary", bkgColor:"red", 
     action: () =>  {} },
    { id: "filter", title: "", icon: "mdi-filter", disabled:false, color:"secondary", bkgColor:"red", 
     action: () =>  (drawer.value = !drawer.value, console.log(drawer.value)) },
  ]
});


let th = [{title: "ID", key: "id"},{title: "ФИО", key: "name"},{title: "Должность", key: "job_title"},{title: "Телефон", key: "phone"}, {title: "E-mail", key: "email"}]

let data = ref([
  {id: "1",name: "Олег", job_title: "Врач окулист", phone: "1233-567-89-01", email: "Asmth@mail.com"},
  {id: "2",name: "Дмитрий", job_title: "Врач педиатр", phone: "9234-557-89-01", email: "Bsmth@mail.com"},
  {id: "3",name: "Владимир", job_title: "Администратор", phone: "5234-800-89-01", email: "Csmth@mail.com"},
  {id: "4",name: "Ольга", job_title: "Врач хирург", phone: "2341-567-89-01", email: "Dsmth@mail.com"},
  {id: "5",name: "Вера", job_title: "Врач окулист", phone: "3114-567-89-01", email: "Esmth@mail.com"},
  {id: "6",name: "Дарья", job_title: "Администратор", phone: "4000-000-89-01", email: "Fsmth@mail.com"},
])

const sortList = (sortBy: any) => {
  if(sorted.value == true){
    data.value.sort((x, y) => ((x[sortBy] < y[sortBy]) ? -1 : 1));
    console.log(checkEmpl.value.length);
    sorted.value = false;
  } else {
    data.value.sort((x, y) => ((x[sortBy] > y[sortBy])? -1 : 1));
    sorted.value = true;
  }
}

</script>
  
  